import { z } from "zod";
import { paginationDto } from "@/lib/dto";

export const createProductDto = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(500).nullable().optional(),
  price: z.number().nonnegative(),
  cost: z.number().nonnegative().optional(),
  imageUrls: z.array(z.url()).optional(),
  isFavorite: z.boolean().optional(),
  isPosAvailable: z.boolean().optional(),
  isMenuAvailable: z.boolean().optional(),
  categoryId: z.string().nullable().optional(),
  productTypeIds: z.array(z.string()).optional(),
});

export const updateProductDto = createProductDto.partial();

export const productQueryDto = paginationDto.extend({
  search: z.string().optional(),
  category_id: z.string().optional(),
  is_favorite: z.coerce.boolean().optional(),
  sort_by: z.enum(["created_at", "name"]).default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("asc"),
});
