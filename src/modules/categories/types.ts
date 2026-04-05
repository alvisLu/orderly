import type { Category } from "@/generated/prisma/client";

export type { Category };

export type CreateCategoryInput = Pick<Category, "name" | "rank">;
export type UpdateCategoryInput = Partial<Pick<Category, "name" | "rank">>;
