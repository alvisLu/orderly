import type { Prisma } from "@/generated/prisma/client";

export type Product = Prisma.ProductGetPayload<{
  include: { category: true; productTypes: { include: { productType: true } } };
}>;

export type CreateProductInput = {
  name: string;
  description?: string | null;
  price: number;
  cost?: number;
  imageUrls?: string[];
  isFavorite?: boolean;
  isPosAvailable?: boolean;
  isMenuAvailable?: boolean;
  categoryId?: string | null;
  productTypeIds?: string[];
};

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductQuery {
  search?: string;
  is_favorite?: boolean;
  sort_by?: "created_at" | "name";
  sort_order?: "asc" | "desc";
  page: number;
  limit: number;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}
