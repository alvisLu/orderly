import { z } from "zod";

export const createProductDto = z.object({
  name: z.string().min(1).max(100),
  description: z.string().nullable().default(null),
  price: z.number().nonnegative(),
  cost: z.number().nonnegative(),
  image_urls: z.array(z.url()).default([]),
  is_favorite: z.boolean().default(false),
  is_pos_available: z.boolean().default(false),
  is_menu_available: z.boolean().default(false),
});

export const updateProductDto = createProductDto.partial();

export const productQueryDto = z.object({
  search: z.string().optional(),
  is_favorite: z.coerce.boolean().optional(),
  sort_by: z.enum(["created_at", "name"]).default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("asc"),
});
