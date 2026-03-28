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
  productOptions: z.array(lineItemOptionDto).default([]),
});

export const createOrderDto = z.object({
  items: z.array(createOrderItemDto).min(1),
  discount: z.number().nonnegative().default(0),
  note: z.string().optional(),
  isDining: z.boolean().optional(),
  userPhone: z.string().optional(),
  userNote: z.string().optional(),
  source: z.string().optional(),
});

export const updateOrderDto = z.object({
  status: z.enum(["pending", "processing", "done"]).optional(),
  financialStatus: z.enum(["pending", "payed", "refunded"]).optional(),
  fulfillmentStatus: z.enum(["pending", "fulfilled", "returned"]).optional(),
  note: z.string().optional(),
  isDining: z.boolean().optional(),
  userPhone: z.string().optional(),
  userNote: z.string().optional(),
});

export const orderQueryDto = paginationDto.extend({
  status: z.enum(["pending", "processing", "done"]).optional(),
});
