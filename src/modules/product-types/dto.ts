import { z } from "zod";

const productTypeItemDto = z.object({
  name: z.string().min(1).max(100),
  price: z.number().nonnegative().default(0),
  isDefault: z.boolean().default(false),
  isDisable: z.boolean().default(false),
});

export const createProductTypeDto = z.object({
  name: z.string().min(1).max(100),
  productIds: z.array(z.string()).default([]),
  isDisable: z.boolean().optional(),
  max: z.number().int().nonnegative().optional(),
  min: z.number().int().nonnegative().optional(),
  items: z.array(productTypeItemDto).default([]),
});

export const productTypeQueryDto = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const updateProductTypeDto = z.object({
  name: z.string().min(1).max(100).optional(),
  isDisable: z.boolean().optional(),
  max: z.number().int().nonnegative().optional(),
  min: z.number().int().nonnegative().optional(),
  items: z.array(productTypeItemDto).optional(),
});
