import { prisma } from "@/lib/prisma";
import { DatabaseError } from "@/lib/http-error";
import type { Prisma } from "@/generated/prisma/client";
import type {
  Order,
  OrderQuery,
  OrderStats,
  OrderStatsQuery,
  PaginatedOrders,
} from "./types";
import Big from "big.js";

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

export async function findOrderStats(
  query: OrderStatsQuery
): Promise<OrderStats> {
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
    let pendingTotal = Big(0);
    let discount = Big(0);
    let refundTotal = Big(0);
    const gatewayMap = new Map<string, Big>();

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
      if (o.financialStatus === "pending" && !isCancelled) {
        pendingTotal = pendingTotal.plus(orderTotal);
      }
      if (o.financialStatus === "refunded") {
        refundTotal = refundTotal.plus(orderTotal);
      }

      const txns = (o.transactions as unknown as TxnRecord[] | null) ?? [];
      for (const t of txns) {
        if (t.type !== "checkout") continue;
        const key = t.gateway?.name ?? "未知";
        const prev = gatewayMap.get(key) ?? Big(0);
        gatewayMap.set(key, prev.plus(Big(t.amount)));
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
      pendingTotal: pendingTotal.toNumber(),
      discount: discount.toNumber(),
      refundTotal: refundTotal.toNumber(),
      peopleCount: count,
      avgPerOrder,
      avgPerPerson: avgPerOrder,
      byGateway: Array.from(gatewayMap.entries()).map(([name, amount]) => ({
        name,
        amount: amount.toNumber(),
      })),
    };
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
