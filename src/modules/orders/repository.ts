import { prisma } from "@/lib/prisma";
import {
  DatabaseError,
  OrderNotAppendableError,
  OrderNotFoundError,
  OrderNotMergeableError,
} from "@/lib/http-error";
import type { Prisma } from "@/generated/prisma/client";
import type {
  CreateOrderItemInput,
  DailyOrdersReport,
  LineItemOption,
  Order,
  OrderQuery,
  OrdersReport,
  OrdersReportQuery,
  PaginatedOrders,
} from "./types";
import Big from "big.js";
import dayjs from "@/lib/dayjs";

const include = {
  lineItems: { include: { product: true } },
} as const;

export async function findAllOrders(
  query: OrderQuery
): Promise<PaginatedOrders> {
  const {
    status,
    isDining,
    sort = "desc",
    page,
    limit,
    showDeleted,
    from,
    to,
  } = query;
  const skip = Big(page - 1)
    .times(limit)
    .toNumber();
  const where = {
    ...(!showDeleted && { deletedAt: null }),
    ...(status && { status }),
    ...(isDining !== undefined && { isDining }),
    ...((from || to) && {
      createdAt: {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
      },
    }),
  };
  try {
    const [rows, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: sort },
        skip,
        take: limit,
        include,
      }),
      prisma.order.count({ where }),
    ]);
    return { data: rows, total, page, limit };
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function findOrderById(
  id: string,
  options?: { showDeleted?: boolean }
): Promise<Order | null> {
  try {
    return await prisma.order.findFirst({
      where: { id, ...(!options?.showDeleted && { deletedAt: null }) },
      include,
    });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function insertOrder(
  data: Prisma.OrderCreateInput
): Promise<Order> {
  try {
    return await prisma.$transaction(async (tx) => {
      const store = await tx.store.findFirstOrThrow();
      const updated = await tx.store.update({
        where: { id: store.id },
        data: { orderCounter: { increment: 1 } },
      });
      return tx.order.create({
        data: { ...data, takeNumber: updated.orderCounter },
        include,
      });
    });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function updateOrder(
  id: string,
  input: Prisma.OrderUpdateInput
): Promise<Order | null> {
  try {
    return await prisma.$transaction(async (tx) => {
      if (input.fulfillmentStatus === "fulfilled") {
        await tx.$executeRaw`UPDATE "line_items" SET "fulfilled_quantity" = "quantity" WHERE "order_id" = ${id}::uuid`;
      }
      return tx.order.update({ where: { id }, data: input, include });
    });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function findOrdersByIds(ids: string[]): Promise<Order[]> {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  try {
    return await prisma.order.findMany({
      where: {
        id: { in: ids },
        deletedAt: null,
        createdAt: { gte: twoHoursAgo },
      },
      orderBy: { createdAt: "desc" },
      include,
    });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function clearAllDining(): Promise<number> {
  try {
    const result = await prisma.order.updateMany({
      where: { isDining: true, deletedAt: null },
      data: { isDining: false },
    });
    return result.count;
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

type TxnRecord = {
  type: "checkout" | "refund";
  amount: number;
  gateway: { id: string; name: string };
};

type OrderForAggregation = {
  total: Prisma.Decimal;
  discount: Prisma.Decimal;
  status: string;
  financialStatus: string;
  transactions: Prisma.JsonValue;
  deletedAt: Date | null;
};

function aggregateOrdersReport(rows: OrderForAggregation[]): OrdersReport {
  let count = 0;
  let total = Big(0);
  let doneTotal = Big(0);
  let cancelledTotal = Big(0);
  let unfinishedTotal = Big(0);
  let processingCount = 0;
  let paidTotal = Big(0);
  let discount = Big(0);
  let refundTotal = Big(0);
  const inMap = new Map<string, Big>();
  const outMap = new Map<string, Big>();

  for (const o of rows) {
    const orderTotal = Big(o.total.toString());
    const orderDiscount = Big(o.discount.toString());
    const isCancelled = o.status === "cancelled" || o.deletedAt !== null;

    count += 1;
    if (!isCancelled) {
      total = total.plus(orderTotal);
      discount = discount.plus(orderDiscount);
    }
    if (o.status === "done" && !isCancelled) {
      doneTotal = doneTotal.plus(orderTotal);
    }
    if (isCancelled) cancelledTotal = cancelledTotal.plus(orderTotal);
    if ((o.status === "pending" || o.status === "processing") && !isCancelled) {
      unfinishedTotal = unfinishedTotal.plus(orderTotal);
    }
    if (o.status === "processing" && !isCancelled) processingCount += 1;
    if (o.financialStatus === "paid") paidTotal = paidTotal.plus(orderTotal);
    if (o.financialStatus === "refunded") {
      refundTotal = refundTotal.plus(orderTotal);
    }

    const txns = (o.transactions as unknown as TxnRecord[] | null) ?? [];
    for (const t of txns) {
      const key = t.gateway?.name ?? "未知";
      if (t.type === "checkout") {
        const prev = inMap.get(key) ?? Big(0);
        inMap.set(key, prev.plus(Big(t.amount)));
      } else if (t.type === "refund") {
        const prev = outMap.get(key) ?? Big(0);
        outMap.set(key, prev.plus(Big(t.amount).abs()));
      }
    }
  }

  const countBig = Big(count);
  const avgPerOrder = count > 0 ? total.div(countBig).round(0).toNumber() : 0;

  return {
    count,
    total: total.toNumber(),
    doneTotal: doneTotal.toNumber(),
    cancelledTotal: cancelledTotal.toNumber(),
    unfinishedTotal: unfinishedTotal.toNumber(),
    processingCount,
    paidTotal: paidTotal.toNumber(),
    discount: discount.toNumber(),
    refundTotal: refundTotal.toNumber(),
    peopleCount: count,
    avgPerOrder,
    avgPerPerson: avgPerOrder,
    byGateway: Array.from(new Set([...inMap.keys(), ...outMap.keys()])).map(
      (name) => ({
        name,
        totalIn: (inMap.get(name) ?? Big(0)).toNumber(),
        totalOut: (outMap.get(name) ?? Big(0)).toNumber(),
      })
    ),
  };
}

export async function findOrdersReport(
  query: OrdersReportQuery
): Promise<OrdersReport> {
  const { from, to, showDeleted } = query;
  const where = {
    ...(!showDeleted && { deletedAt: null }),
    ...((from || to) && {
      createdAt: {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
      },
    }),
  };

  try {
    const rows = await prisma.order.findMany({
      where,
      select: {
        total: true,
        discount: true,
        status: true,
        financialStatus: true,
        transactions: true,
        deletedAt: true,
      },
    });
    return aggregateOrdersReport(rows);
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

function rowToReport(row: {
  date: Date;
  count: number;
  total: Prisma.Decimal;
  doneTotal: Prisma.Decimal;
  cancelledTotal: Prisma.Decimal;
  unfinishedTotal: Prisma.Decimal;
  processingCount: number;
  paidTotal: Prisma.Decimal;
  discount: Prisma.Decimal;
  refundTotal: Prisma.Decimal;
  peopleCount: number;
  avgPerOrder: Prisma.Decimal;
  avgPerPerson: Prisma.Decimal;
  byGateway: Prisma.JsonValue | null;
}): DailyOrdersReport {
  return {
    date: dayjs.utc(row.date).format("YYYY-MM-DD"),
    count: row.count,
    total: Number(row.total),
    doneTotal: Number(row.doneTotal),
    cancelledTotal: Number(row.cancelledTotal),
    unfinishedTotal: Number(row.unfinishedTotal),
    processingCount: row.processingCount,
    paidTotal: Number(row.paidTotal),
    discount: Number(row.discount),
    refundTotal: Number(row.refundTotal),
    peopleCount: row.peopleCount,
    avgPerOrder: Number(row.avgPerOrder),
    avgPerPerson: Number(row.avgPerPerson),
    byGateway: (row.byGateway as unknown as OrdersReport["byGateway"]) ?? [],
  };
}

export async function findOrderReportByDate(
  date: Date
): Promise<DailyOrdersReport | null> {
  try {
    const row = await prisma.orderReport.findUnique({ where: { date } });
    return row ? rowToReport(row) : null;
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function findOrderReportsInRange(
  from: Date,
  to: Date
): Promise<DailyOrdersReport[]> {
  try {
    const rows = await prisma.orderReport.findMany({
      where: { date: { gte: from, lte: to } },
      orderBy: { date: "asc" },
    });
    return rows.map(rowToReport);
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function generateOrderReportForDate(
  date: Date
): Promise<DailyOrdersReport> {
  const from = dayjs.utc(date).startOf("day").toDate();
  const to = dayjs.utc(date).endOf("day").toDate();
  try {
    const rows = await prisma.order.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: {
        total: true,
        discount: true,
        status: true,
        financialStatus: true,
        transactions: true,
        deletedAt: true,
      },
    });
    const report = aggregateOrdersReport(rows);
    const data = {
      count: report.count,
      total: report.total,
      doneTotal: report.doneTotal,
      cancelledTotal: report.cancelledTotal,
      unfinishedTotal: report.unfinishedTotal,
      processingCount: report.processingCount,
      paidTotal: report.paidTotal,
      discount: report.discount,
      refundTotal: report.refundTotal,
      peopleCount: report.peopleCount,
      avgPerOrder: report.avgPerOrder,
      avgPerPerson: report.avgPerPerson,
      byGateway: report.byGateway as unknown as Prisma.InputJsonValue,
    };
    await prisma.orderReport.upsert({
      where: { date: from },
      create: { date: from, ...data },
      update: data,
    });
    return { ...report, date: dayjs.utc(from).format("YYYY-MM-DD") };
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function mergeOrders(
  primaryId: string,
  secondaryIds: string[]
): Promise<Order> {
  try {
    return await prisma.$transaction(async (tx) => {
      const allIds = [primaryId, ...secondaryIds];
      const orders = await tx.order.findMany({
        where: { id: { in: allIds }, deletedAt: null },
        include,
      });
      if (orders.length !== allIds.length) throw new OrderNotFoundError();

      const primary = orders.find((o) => o.id === primaryId);
      if (!primary) throw new OrderNotFoundError();
      const secondaries = orders.filter((o) => o.id !== primaryId);

      const allMergeable = orders.every((o) => o.financialStatus === "pending");
      if (!allMergeable) throw new OrderNotMergeableError();

      let nextRank =
        primary.lineItems.reduce((m, i) => Math.max(m, i.rank), 0) + 1;
      for (const sec of secondaries) {
        const sortedItems = [...sec.lineItems].sort((a, b) => a.rank - b.rank);
        for (const item of sortedItems) {
          await tx.lineItem.update({
            where: { id: item.id },
            data: { orderId: primaryId, rank: nextRank++ },
          });
        }
      }

      const now = new Date();
      for (const sec of secondaries) {
        await tx.order.update({
          where: { id: sec.id },
          data: {
            total: 0,
            note: `合併訂單: ${primaryId}`,
            isDining: false,
            status: "cancelled",
            deletedAt: now,
          },
        });
      }

      const newDiscount = Big(primary.discount.toString()).plus(
        secondaries.reduce((s, o) => s.plus(o.discount.toString()), Big(0))
      );

      const refreshed = await tx.order.findFirstOrThrow({
        where: { id: primaryId },
        include,
      });

      const itemsTotal = refreshed.lineItems.reduce((sum, item) => {
        const opts = (item.itemOptions as unknown as LineItemOption[]) ?? [];
        const optsPrice = opts.reduce((s, o) => s.plus(o.price), Big(0));
        return sum.plus(
          Big(item.price.toString()).plus(optsPrice).times(item.quantity)
        );
      }, Big(0));
      const newTotal = itemsTotal.minus(newDiscount).toNumber();

      const totalQty = refreshed.lineItems.reduce((s, i) => s + i.quantity, 0);
      const totalFulfilled = refreshed.lineItems.reduce(
        (s, i) => s + i.fulfilledQuantity,
        0
      );
      const fulfillmentStatus =
        totalFulfilled === 0
          ? "pending"
          : totalFulfilled >= totalQty
            ? "fulfilled"
            : "partiallyFulfilled";

      return tx.order.update({
        where: { id: primaryId },
        data: {
          total: newTotal,
          discount: newDiscount.toNumber(),
          fulfillmentStatus,
        },
        include,
      });
    });
  } catch (e) {
    if (
      e instanceof OrderNotFoundError ||
      e instanceof OrderNotMergeableError
    ) {
      throw e;
    }
    throw new DatabaseError(String(e));
  }
}

export async function appendOrderLineItems(
  orderId: string,
  items: CreateOrderItemInput[]
): Promise<Order> {
  try {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, deletedAt: null },
        include,
      });
      if (!order) throw new OrderNotFoundError();
      if (order.financialStatus !== "pending") {
        throw new OrderNotAppendableError();
      }

      const maxRank = order.lineItems.reduce((m, i) => Math.max(m, i.rank), -1);

      for (let i = 0; i < items.length; i++) {
        const { productOptions, ...rest } = items[i];
        await tx.lineItem.create({
          data: {
            ...rest,
            rank: maxRank + 1 + i,
            itemOptions: productOptions,
            orderId,
          },
        });
      }

      const refreshed = await tx.order.findFirstOrThrow({
        where: { id: orderId },
        include,
      });

      const itemsTotal = refreshed.lineItems.reduce((sum, item) => {
        const opts = (item.itemOptions as unknown as LineItemOption[]) ?? [];
        const optsPrice = opts.reduce((s, o) => s.plus(o.price), Big(0));
        return sum.plus(
          Big(item.price.toString()).plus(optsPrice).times(item.quantity)
        );
      }, Big(0));
      const newTotal = itemsTotal
        .minus(Big(refreshed.discount.toString()))
        .toNumber();

      const fulfillmentStatus =
        refreshed.fulfillmentStatus === "fulfilled"
          ? "partiallyFulfilled"
          : refreshed.fulfillmentStatus;

      return tx.order.update({
        where: { id: orderId },
        data: { total: newTotal, fulfillmentStatus },
        include,
      });
    });
  } catch (e) {
    if (
      e instanceof OrderNotFoundError ||
      e instanceof OrderNotAppendableError
    ) {
      throw e;
    }
    throw new DatabaseError(String(e));
  }
}

export async function softDeleteOrder(id: string): Promise<void> {
  try {
    await prisma.order.update({
      where: { id },
      data: { status: "cancelled", deletedAt: new Date() },
    });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}
