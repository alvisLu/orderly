import { prisma } from "@/lib/prisma";
import { DatabaseError } from "@/lib/http-error";
import type { Prisma } from "@/generated/prisma/client";
import type {
  Order,
  OrderQuery,
  PaginatedOrders,
} from "./types";
import Big from "big.js";

const include = {
  lineItems: { include: { product: true } },
} as const;

export async function findAllOrders(
  query: OrderQuery
): Promise<PaginatedOrders> {
  const { status, isDining, sort = "desc", page, limit, showDeleted } = query;
  const skip = Big(page - 1)
    .times(limit)
    .toNumber();
  const where = {
    ...(!showDeleted && { deletedAt: null }),
    ...(status && { status }),
    ...(isDining !== undefined && { isDining }),
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
