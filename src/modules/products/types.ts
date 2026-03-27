export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cost: number;
  image_urls: string[];
  is_favorite: boolean;
  is_pos_available: boolean;
  is_menu_available: boolean;
  category_id: string | null;
  category?: { id: string; name: string } | null;
  created_at: string;
  updated_at: string;
}

export type CreateProductInput = Omit<
  Product,
  "id" | "created_at" | "updated_at" | "category_id"
>;
export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductQuery {
  search?: string;
  is_favorite?: boolean;
  sort_by?: "created_at" | "name";
  sort_order?: "asc" | "desc";
}
