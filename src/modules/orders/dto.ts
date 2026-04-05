import { z } from "zod";
import { paginationDto } from "@/lib/dto";

const lineItemOptionDto = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  productTypeName: z.string().min(1),
});

const createOrderItemDto = z.object({
  rank: z.number().int().nonnegative(),
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
  originalPrice: z.number().nonnegative(),
  name: z.string().min(1),
  cost: z.number().nonnegative(),
  productOptions: z.array(lineItemOptionDto).default([]),
});

export const createOrderDto = z.object({
  items: z.array(createOrderItemDto).min(1),
  discount: z.number().nonnegative().default(0),
  note: z.string().optional(),
  isDining: z.boolean().optional(),
  userPhone: z.string().optional(),
  userNote: z.string().optional(),
  tableName: z.string().optional(),
  source: z.enum(["store", "qrcode", "online"]),
  financialStatus: z.enum(["pending", "paid", "refunded"]).optional(),
  fulfillmentStatus: z.enum(["pending", "fulfilled", "returned"]).optional(),
});

const transactionDto = z.object({
  type: z.enum(["checkout", "refund"]),
  amount: z.number().nonnegative(),
  gateway: z.object({
    id: z.string(),
    name: z.string(),
  }),
  note: z.string().optional(),
});

export const updateOrderDto = z.object({
  status: z.enum(["pending", "processing", "done"]).optional(),
  financialStatus: z.enum(["pending", "paid", "refunded"]).optional(),
  fulfillmentStatus: z.enum(["pending", "fulfilled", "returned"]).optional(),
  note: z.string().optional(),
  isDining: z.boolean().optional(),
  userPhone: z.string().optional(),
  userNote: z.string().optional(),
  transaction: transactionDto.optional(),
});

export const orderQueryDto = paginationDto.extend({
  status: z.enum(["pending", "processing", "done"]).optional(),
});
