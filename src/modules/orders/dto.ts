import { z } from "zod";
import { paginationDto } from "@/lib/dto";
import { MAX_ITEM_QUANTITY } from "./constants";

const lineItemOptionDto = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
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

const onlineLineItemOptionDto = z.object({
  optionName: z.string().min(1),
  productTypeId: z.string().uuid(),
});

const createOnlineOrderItemDto = z.object({
  rank: z.number().int().nonnegative(),
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(MAX_ITEM_QUANTITY),
  productOptions: z.array(onlineLineItemOptionDto).default([]),
});

const gatewayDto = z.object({
  id: z.string(),
  name: z.string(),
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
  fulfillmentStatus: z
    .enum(["pending", "partiallyFulfilled", "fulfilled", "returned"])
    .optional(),
  gateway: gatewayDto.optional(),
});

export const createOnlineOrderDto = z.object({
  items: z.array(createOnlineOrderItemDto).min(1).max(20),
  note: z.string().max(200).optional(),
  userPhone: z.string().optional(),
  userNote: z.string().max(200).optional(),
  tableName: z.string().max(10).optional(),
});

export const updateOrderDto = z.object({
  status: z.enum(["pending", "processing", "done", "cancelled"]).optional(),
  financialStatus: z.enum(["pending", "paid", "refunded"]).optional(),
  fulfillmentStatus: z
    .enum(["pending", "partiallyFulfilled", "fulfilled", "returned"])
    .optional(),
  note: z.string().optional(),
  isDining: z.boolean().optional(),
  userPhone: z.string().optional(),
  userNote: z.string().optional(),
  gateway: gatewayDto.optional(),
});

export const orderQueryDto = paginationDto.extend({
  status: z.enum(["pending", "processing", "done", "cancelled"]).optional(),
  isDining: z.coerce.boolean().optional(),
  sort: z.enum(["asc", "desc"]).optional(),
  showDeleted: z.coerce.boolean().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const ordersReportQueryDto = z.object({
  showDeleted: z.coerce.boolean().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const checkoutTransactionsQueryDto = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const dailyReportBucketsDto = z.object({
  buckets: z
    .array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        from: z.coerce.date(),
        to: z.coerce.date(),
      })
    )
    .min(1),
});

export const orderPollQueryDto = z.object({
  from: z.coerce.date(),
});

export const mergeOrdersDto = z.object({
  primaryId: z.string().uuid(),
  secondaryIds: z.array(z.string().uuid()).min(1),
});

export const appendOrderItemsDto = z.object({
  items: z.array(createOrderItemDto).min(1),
});
