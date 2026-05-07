import Big from "big.js";
import dayjs from "@/lib/dayjs";
import {
  findAllOrders,
  findOrderById,
  findOrderReportsInRange,
  findOrdersReport,
  findOrdersByIds,
  generateOrderReportForDate,
  insertOrder,
  mergeOrders as mergeOrdersRepo,
  updateOrder,
  clearAllDining,
  softDeleteOrder,
} from "./repository";
import type {
  CreateOrderInput,
  DailyOrdersReport,
  Order,
  OrderQuery,
  OrdersReport,
  OrdersReportQuery,
  OrderTransactionInput,
  PaginatedOrders,
  UpdateOrderInput,
} from "./types";
import {
  OrderAlreadyCheckedOutError,
  OrderNotFoundError,
} from "@/lib/http-error";
import {
  OrderStatus,
  OrderFinancialStatus,
  OrderFulfillmentStatus,
} from "@/generated/prisma/client";

export async function getOrders(query: OrderQuery): Promise<PaginatedOrders> {
  return findAllOrders(query);
}

export async function getOrdersReport(
  query: OrdersReportQuery
): Promise<OrdersReport> {
  return findOrdersReport(query);
}

export async function regenerateOrderReports(
  from: Date,
  to: Date
): Promise<DailyOrdersReport[]> {
  const startUtc = dayjs.utc(from).startOf("day");
  const endUtc = dayjs.utc(to).startOf("day");
  const todayUtc = dayjs.utc().startOf("day");

  const dates: dayjs.Dayjs[] = [];
  let cursor = startUtc;
  while (cursor.isBefore(endUtc) || cursor.isSame(endUtc)) {
    dates.push(cursor);
    cursor = cursor.add(1, "day");
  }

  return Promise.all(
    dates.map((d) =>
      d.isAfter(todayUtc)
        ? zeroDailyReport(d.format("YYYY-MM-DD"))
        : generateOrderReportForDate(d.toDate())
    )
  );
}

function zeroDailyReport(date: string): DailyOrdersReport {
  return {
    date,
    count: 0,
    total: 0,
    doneTotal: 0,
    cancelledTotal: 0,
    unfinishedTotal: 0,
    processingCount: 0,
    paidTotal: 0,
    discount: 0,
    refundTotal: 0,
    peopleCount: 0,
    avgPerOrder: 0,
    avgPerPerson: 0,
    byGateway: [],
  };
}

export async function getDailyOrderReports(
  from: Date,
  to: Date
): Promise<DailyOrdersReport[]> {
  const startUtc = dayjs.utc(from).startOf("day");
  const endUtc = dayjs.utc(to).startOf("day");
  const todayUtc = dayjs.utc().startOf("day");

  const existing = new Map(
    (
      await findOrderReportsInRange(startUtc.toDate(), endUtc.toDate())
    ).map((r) => [r.date, r])
  );

  const reports: DailyOrdersReport[] = [];
  let cursor = startUtc;
  while (cursor.isBefore(endUtc) || cursor.isSame(endUtc)) {
    const key = cursor.format("YYYY-MM-DD");
    const cached = existing.get(key);
    if (cached) {
      reports.push(cached);
    } else if (cursor.isAfter(todayUtc)) {
      reports.push(zeroDailyReport(key));
    } else {
      reports.push(await generateOrderReportForDate(cursor.toDate()));
    }
    cursor = cursor.add(1, "day");
  }

  return reports;
}

export async function getOrdersByIds(ids: string[]): Promise<Order[]> {
  return findOrdersByIds(ids);
}

export async function getOrder(id: string): Promise<Order> {
  const order = await findOrderById(id);
  if (!order) throw new OrderNotFoundError();
  return order;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const { items, discount, gateway, ...rest } = input;

  const total = items
    .reduce((sum, item) => {
      const optionsTotal = item.productOptions.reduce(
        (s, o) => s.plus(Big(o.price).times(o.quantity)),
        Big(0)
      );
      return sum.plus(Big(item.price).times(item.quantity)).plus(optionsTotal);
    }, Big(0))
    .minus(discount)
    .toNumber();

  const lineItems = {
    create: input.items.map(({ productOptions, ...item }) => ({
      ...item,
      itemOptions: productOptions,
    })),
  };

  const isCompleted =
    rest.financialStatus === OrderFinancialStatus.paid &&
    rest.fulfillmentStatus === OrderFulfillmentStatus.fulfilled;
  const isStoreOrder = rest.source === "store";

  let status: OrderStatus = OrderStatus.pending;

  if (isCompleted) {
    status = OrderStatus.done;
  } else if (isStoreOrder) {
    status = OrderStatus.processing;
  }

  const transaction = gateway
    ? {
        type: "checkout" as const,
        amount: total,
        gateway,
        date: dayjs().toISOString(),
      }
    : undefined;

  return insertOrder({
    ...rest,
    discount,
    lineItems,
    total,
    status,
    ...(transaction && {
      transactions: [transaction] as Parameters<
        typeof insertOrder
      >[0]["transactions"],
    }),
  });
}

export async function editOrder(
  id: string,
  input: UpdateOrderInput
): Promise<Order> {
  const existing = await findOrderById(id);
  if (!existing) throw new OrderNotFoundError();

  const { gateway, ...rest } = input;

  // Resolve final statuses (input overrides existing)
  const finalFinancial = rest.financialStatus ?? existing.financialStatus;
  const finalFulfillment = rest.fulfillmentStatus ?? existing.fulfillmentStatus;

  // Auto-complete order when both paid and fulfilled
  if (
    finalFinancial === OrderFinancialStatus.paid &&
    finalFulfillment === OrderFulfillmentStatus.fulfilled
  ) {
    rest.status = OrderStatus.done;
  }

  // Compose transaction from gateway + financialStatus transition
  let transactionsUpdate: unknown[] | undefined;
  if (gateway) {
    const existingTxns =
      (existing.transactions as unknown as OrderTransactionInput[] | null) ??
      [];
    let newTxn: OrderTransactionInput | undefined;

    if (finalFinancial === OrderFinancialStatus.paid) {
      if (existingTxns.some((t) => t.type === "checkout")) {
        throw new OrderAlreadyCheckedOutError();
      }
      newTxn = {
        type: "checkout",
        amount: Number(existing.total),
        gateway,
        date: dayjs().toISOString(),
      };
    } else if (finalFinancial === OrderFinancialStatus.refunded) {
      const checkoutTotal = existingTxns
        .filter((t) => t.type === "checkout")
        .reduce((sum, t) => sum + t.amount, 0);
      if (checkoutTotal > 0) {
        newTxn = {
          type: "refund",
          amount: -checkoutTotal,
          gateway,
          date: dayjs().toISOString(),
        };
      }
    }

    if (newTxn) {
      transactionsUpdate = [...existingTxns, newTxn];
    }
  }

  const order = await updateOrder(id, {
    ...rest,
    ...(transactionsUpdate !== undefined && {
      transactions: transactionsUpdate as Parameters<
        typeof updateOrder
      >[1]["transactions"],
    }),
  });
  if (!order) throw new OrderNotFoundError();
  return order;
}

export async function leaveAllDining(): Promise<number> {
  return clearAllDining();
}

export async function mergeOrders(
  primaryId: string,
  secondaryIds: string[]
): Promise<Order> {
  return mergeOrdersRepo(primaryId, secondaryIds);
}

export async function removeOrder(id: string): Promise<void> {
  const order = await findOrderById(id);
  if (!order) throw new OrderNotFoundError();
  return softDeleteOrder(id);
}
