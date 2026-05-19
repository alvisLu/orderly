import Big from "big.js";
import { after } from "next/server";
import dayjs from "@/lib/dayjs";
import { prisma } from "@/lib/prisma";
import { sendDiscordOrderNotification } from "@/lib/discord-notification";
import {
  appendOrderLineItems,
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
  CreateOnlineOrderInput,
  CreateOrderInput,
  CreateOrderItemInput,
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
  ProductNotFoundError,
  ProductTypeNotFoundError,
  TableNotFoundError,
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
    (await findOrderReportsInRange(startUtc.toDate(), endUtc.toDate())).map(
      (r) => [r.date, r]
    )
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

export async function getOrder(
  id: string,
  options?: { showDeleted?: boolean }
): Promise<Order> {
  const order = await findOrderById(id, options);
  if (!order) throw new OrderNotFoundError();
  return order;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const { items, discount, gateway, ...rest } = input;

  const total = items
    .reduce((sum, item) => {
      const optionsPrice = item.productOptions.reduce(
        (s, o) => s.plus(o.price),
        Big(0)
      );
      return sum.plus(Big(item.price).plus(optionsPrice).times(item.quantity));
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

  const order = await insertOrder({
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

  if (rest.source !== "store") {
    after(async () => {
      const store = await prisma.store.findFirst({
        select: { discordWebhookUrl: true },
      });
      if (!store?.discordWebhookUrl) return;
      await sendDiscordOrderNotification(store.discordWebhookUrl, {
        takeNumber: order.takeNumber,
        total: order.total.toString(),
        tableName: order.tableName,
        userNote: order.userNote,
        createdAt: order.createdAt,
        lineItems: order.lineItems.map((li) => ({
          productName: li.product?.name ?? "找不到商品名稱",
          quantity: li.quantity,
          price: li.price.toString(),
        })),
      });
    });
  }

  return order;
}

export async function createOnlineOrder(
  input: CreateOnlineOrderInput
): Promise<Order> {
  if (input.tableName) {
    const table = await prisma.table.findFirst({
      where: { name: input.tableName, isActive: true },
      select: { id: true },
    });
    if (!table) throw new TableNotFoundError();
  }

  const productIds = [...new Set(input.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      price: true,
      cost: true,
      productTypes: {
        select: {
          productType: { select: { id: true, name: true, items: true } },
        },
      },
    },
  });

  const productMap = new Map(
    products.map((p) => {
      const optionMap = new Map<
        string,
        { price: number; productTypeName: string }
      >();
      for (const { productType } of p.productTypes) {
        const items = productType.items as Array<{
          name: string;
          price: number;
        }>;
        for (const item of items) {
          optionMap.set(`${productType.id}::${item.name}`, {
            price: item.price,
            productTypeName: productType.name,
          });
        }
      }
      return [
        p.id,
        {
          name: p.name,
          price: p.price.toNumber(),
          cost: p.cost.toNumber(),
          optionMap,
        },
      ];
    })
  );

  const items: CreateOrderItemInput[] = input.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) throw new ProductNotFoundError();

    const productOptions = item.productOptions.map((option) => {
      const meta = product.optionMap.get(
        `${option.productTypeId}::${option.optionName}`
      );
      if (!meta) throw new ProductTypeNotFoundError();
      return {
        name: option.optionName,
        price: meta.price,
        productTypeName: meta.productTypeName,
      };
    });

    return {
      rank: item.rank,
      productId: item.productId,
      quantity: item.quantity,
      name: product.name,
      cost: product.cost,
      price: product.price,
      originalPrice: product.price,
      productOptions,
    };
  });

  return createOrder({
    ...input,
    items,
    discount: 0,
    isDining: true,
    source: "qrcode",
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

export async function appendOrderItems(
  id: string,
  items: CreateOrderItemInput[]
): Promise<Order> {
  return appendOrderLineItems(id, items);
}

export async function removeOrder(id: string): Promise<void> {
  const order = await findOrderById(id);
  if (!order) throw new OrderNotFoundError();
  return softDeleteOrder(id);
}
