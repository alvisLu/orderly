import {
  findAllOrders,
  findOrderById,
  insertOrder,
  updateOrder,
  softDeleteOrder,
} from "./repository";
import type {
  CreateOrderInput,
  Order,
  OrderQuery,
  PaginatedOrders,
  UpdateOrderInput,
} from "./types";
import { OrderNotFoundError } from "@/lib/http-error";

export async function getOrders(query: OrderQuery): Promise<PaginatedOrders> {
  return findAllOrders(query);
}

export async function getOrder(id: string): Promise<Order> {
  const order = await findOrderById(id);
  if (!order) throw new OrderNotFoundError();
  return order;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  return insertOrder(input);
}

export async function editOrder(id: string, input: UpdateOrderInput): Promise<Order> {
  const order = await updateOrder(id, input);
  if (!order) throw new OrderNotFoundError();
  return order;
}

export async function removeOrder(id: string): Promise<void> {
  const order = await findOrderById(id);
  if (!order) throw new OrderNotFoundError();
  return softDeleteOrder(id);
}
