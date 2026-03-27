export interface Category {
  id: string;
  name: string;
  rank: number;
  created_at: string;
  updated_at: string;
}

export type CreateCategoryInput = Pick<Category, "name" | "rank">;
export type UpdateCategoryInput = Pick<Category, "rank">;
