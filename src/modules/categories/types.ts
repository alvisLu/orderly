import type { Category } from "@/generated/prisma/client";

export type { Category };

export type CreateCategoryInput = Pick<Category, "name" | "rank">;
export type UpdateCategoryInput = Pick<Category, "rank">;
