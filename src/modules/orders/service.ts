import Big from "big.js";
import {
  findAllOrders,
  findOrderById,
  findOrdersByIds,
  insertOrder,
  updateOrder,
  clearAllDining,
  softDeleteOrder,
} from "./repository";
import type {
  CreateOrderInput,
  Order,
  OrderQuery,
  PaginatedOrders,
  UpdateOrderInput,
} from "./types";
import {
  OrderAlreadyCheckedOutError,
  OrderNotFoundError,
} from "@/lib/http-error";

export async function getOrders(query: OrderQuery): Promise<PaginatedOrders> {
  return findAllOrders(query);
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

  const lineItems = {
    create: input.items.map(({ productOptions, ...item }) => ({
      ...item,
      itemOptions: productOptions,
    })),
  };

  return insertOrder({ ...rest, discount, lineItems, total });
}

export async function editOrder(
  id: string,
  input: UpdateOrderInput
): Promise<Order> {
  const existing = await findOrderById(id);
  if (!existing) throw new OrderNotFoundError();

  const { transaction, ...rest } = input;

  // Resolve final statuses (input overrides existing)
  const finalFinancial = rest.financialStatus ?? existing.financialStatus;
  const finalFulfillment = rest.fulfillmentStatus ?? existing.fulfillmentStatus;

  // Auto-complete order when both paid and fulfilled
  if (finalFinancial === "paid" && finalFulfillment === "fulfilled") {
    rest.status = "done";
  }

  // Append transaction to existing transactions array
  let transactionsUpdate: unknown[] | undefined;
  if (transaction) {
    const existing_txns = (existing.transactions as unknown[] | null) ?? [];
    if (
      transaction.type === "checkout" &&
      existing_txns.some((t) => (t as { type: string }).type === "checkout")
    ) {
      throw new OrderAlreadyCheckedOutError();
    }
    transactionsUpdate = [...existing_txns, transaction];
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
