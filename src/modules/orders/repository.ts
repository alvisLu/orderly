import { prisma } from "@/lib/prisma";
import { DatabaseError } from "@/lib/http-error";
import type { Prisma } from "@/generated/prisma/client";
import type {
  DailyGatewayStats,
  DailyGatewayStatsQuery,
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
  const { status, isDining, sort = "desc", page, limit, showDeleted, from, to } = query;
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

export async function findOrderById(id: string): Promise<Order | null> {
  try {
    return await prisma.order.findFirst({
      where: { id, deletedAt: null },
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
    return await prisma.order.update({ where: { id }, data: input, include });
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
      if (
        (o.status === "pending" || o.status === "processing") &&
        !isCancelled
      ) {
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
      byGateway: Array.from(
        new Set([...inMap.keys(), ...outMap.keys()])
      ).map((name) => ({
        name,
        totalIn: (inMap.get(name) ?? Big(0)).toNumber(),
        totalOut: (outMap.get(name) ?? Big(0)).toNumber(),
      })),
    };
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function findDailyGatewayStats(
  query: DailyGatewayStatsQuery
): Promise<DailyGatewayStats> {
  const { from, to, showDeleted } = query;
  const where = {
    ...(!showDeleted && { deletedAt: null }),
    createdAt: { gte: from, lte: to },
  };

  try {
    const rows = await prisma.order.findMany({
      where,
      select: { createdAt: true, transactions: true },
    });

    const dayMap = new Map<string, Map<string, Big>>();
    const gatewaySet = new Set<string>();

    for (const o of rows) {
      const day = dayjs.utc(o.createdAt).format("YYYY-MM-DD");
      const txns = (o.transactions as unknown as TxnRecord[] | null) ?? [];
      for (const t of txns) {
        if (t.type !== "checkout") continue;
        const name = t.gateway?.name ?? "未知";
        gatewaySet.add(name);
        const inner = dayMap.get(day) ?? new Map<string, Big>();
        inner.set(name, (inner.get(name) ?? Big(0)).plus(Big(t.amount)));
        dayMap.set(day, inner);
      }
    }

    const days: string[] = [];
    let cursor = dayjs.utc(from).startOf("day");
    const last = dayjs.utc(to).startOf("day");
    while (cursor.isBefore(last) || cursor.isSame(last)) {
      days.push(cursor.format("YYYY-MM-DD"));
      cursor = cursor.add(1, "day");
    }

    const gateways = Array.from(gatewaySet).sort();
    const result = days.map((date) => {
      const inner = dayMap.get(date);
      const totals: Record<string, number> = {};
      for (const name of gateways) {
        totals[name] = inner?.get(name)?.toNumber() ?? 0;
      }
      return { date, totals };
    });

    return { gateways, rows: result };
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function softDeleteOrder(id: string): Promise<void> {
  try {
    await prisma.order.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}
