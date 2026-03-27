import { z } from "zod";

export const createCategoryDto = z.object({
  name: z.string().min(1).max(100),
  rank: z.number().int().nonnegative(),
});

export const updateCategoryDto = z.object({
  name: z.string().min(1).max(100),
});

export const reorderCategoriesDto = z.object({
  categories: z
    .array(
      z.object({
        id: z.uuid(),
        rank: z.number().int().nonnegative(),
      })
    )
    .min(1),
});
