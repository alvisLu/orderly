import apiClient from "@/lib/api-client";
import type {
  CreateProductInput,
  PaginatedProducts,
  Product,
  ProductQuery,
  UpdateProductInput,
} from "@/modules/products/types";

export async function apiGetProducts(query?: Partial<ProductQuery>): Promise<PaginatedProducts> {
  const params = new URLSearchParams();
  if (query?.search) params.set("search", query.search);
  if (query?.is_favorite) params.set("is_favorite", "true");
  if (query?.sort_by) params.set("sort_by", query.sort_by);
  if (query?.sort_order) params.set("sort_order", query.sort_order);
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  const { data } = await apiClient.get<PaginatedProducts>(`/products?${params}`);
  return data;
}

export async function apiCreateProduct(
  input: CreateProductInput
): Promise<Product> {
  const { data } = await apiClient.post<Product>("/products", input);
  return data;
}

export async function apiUpdateProduct(
  id: string,
  input: UpdateProductInput
): Promise<Product> {
  const { data } = await apiClient.patch<Product>(`/products/${id}`, input);
  return data;
}

export async function apiDeleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}
