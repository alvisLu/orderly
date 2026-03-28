import { z } from "zod";

export const createProductDto = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  price: z.number().nonnegative(),
  cost: z.number().nonnegative().optional(),
  imageUrls: z.array(z.url()).optional(),
  isFavorite: z.boolean().optional(),
  isPosAvailable: z.boolean().optional(),
  isMenuAvailable: z.boolean().optional(),
  categoryId: z.string().nullable().optional(),
});

export const updateProductDto = createProductDto.partial();

export const productQueryDto = z.object({
  search: z.string().optional(),
  is_favorite: z.coerce.boolean().optional(),
  sort_by: z.enum(["created_at", "name"]).default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("asc"),
});
