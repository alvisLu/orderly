import { z } from "zod";

export const createProductDto = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  price: z.number().nonnegative(),
  cost: z.number().nonnegative().optional(),
  image_urls: z.array(z.url()).optional(),
  is_favorite: z.boolean().optional(),
  is_pos_available: z.boolean().optional(),
  is_menu_available: z.boolean().optional(),
});

export const updateProductDto = createProductDto.partial();

export const productQueryDto = z.object({
  search: z.string().optional(),
  is_favorite: z.coerce.boolean().optional(),
  sort_by: z.enum(["created_at", "name"]).default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("asc"),
});
