import Big from "big.js";
import { prisma } from "@/lib/prisma";
import { DatabaseError } from "@/lib/http-error";
import type {
  CreateOrderInput,
  Order,
  OrderQuery,
  PaginatedOrders,
  UpdateOrderInput,
} from "./types";

const include = {
  lineItems: { include: { product: true } },
} as const;

export async function findAllOrders(
  query: OrderQuery
): Promise<PaginatedOrders> {
  const { status, page, limit } = query;
  const skip = Big(page - 1)
    .times(limit)
    .toNumber();
  const where = {
    deletedAt: null,
    ...(status && { status }),
  };
  try {
    const [rows, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
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

export async function insertOrder(input: CreateOrderInput): Promise<Order> {
  const { items, discount, ...rest } = input;

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


  try {
    return await prisma.order.create({
      data: {
        ...rest,
        discount,
        total,
        lineItems: {
          create: items.map(({ productOptions, ...item }) => ({
            ...item,
            itemOptions: productOptions,
          })),
        },
      },
      include,
    });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function updateOrder(
  id: string,
  input: UpdateOrderInput
): Promise<Order | null> {
  try {
    return await prisma.order.update({ where: { id }, data: input, include });
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
