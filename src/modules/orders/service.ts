import Big from "big.js";
import dayjs from "@/lib/dayjs";
import {
  findAllOrders,
  findDailyGatewayStats,
  findOrderById,
  findOrderReportByDate,
  findOrdersReport,
  findOrdersByIds,
  generateOrderReportForDate,
  insertOrder,
  updateOrder,
  clearAllDining,
  softDeleteOrder,
} from "./repository";
import type {
  CreateOrderInput,
  DailyGatewayStats,
  DailyGatewayStatsQuery,
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

export async function getOrderReportByDate(
  date: Date
): Promise<OrdersReport | null> {
  return findOrderReportByDate(date);
}

export async function generateOrderReport(date: Date): Promise<OrdersReport> {
  return generateOrderReportForDate(date);
}

export async function getDailyGatewayStats(
  query: DailyGatewayStatsQuery
): Promise<DailyGatewayStats> {
  return findDailyGatewayStats(query);
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

export async function removeOrder(id: string): Promise<void> {
  const order = await findOrderById(id);
  if (!order) throw new OrderNotFoundError();
  return softDeleteOrder(id);
}
