import type {
  CreateProductInput,
  Product,
  ProductQuery,
  UpdateProductInput,
} from "@/modules/products/types";

export async function apiGetProducts(query?: ProductQuery): Promise<Product[]> {
  const params = new URLSearchParams();
  if (query?.search) params.set("search", query.search);
  if (query?.is_favorite) params.set("is_favorite", "true");
  if (query?.sort_by) params.set("sort_by", query.sort_by);
  if (query?.sort_order) params.set("sort_order", query.sort_order);
  const res = await fetch(`/api/products?${params}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function apiCreateProduct(
  input: CreateProductInput
): Promise<Product> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

export async function apiUpdateProduct(
  id: string,
  input: UpdateProductInput
): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

export async function apiDeleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete product");
}
