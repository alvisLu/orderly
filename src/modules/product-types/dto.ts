import { z } from "zod";
import { paginationDto } from "@/lib/dto";

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

export const productTypeQueryDto = paginationDto;

export const updateProductTypeDto = z.object({
  name: z.string().min(1).max(100).optional(),
  productIds: z.array(z.string()).optional(),
  isDisable: z.boolean().optional(),
  max: z.number().int().nonnegative().optional(),
  min: z.number().int().nonnegative().optional(),
  items: z.array(productTypeItemDto).optional(),
});
