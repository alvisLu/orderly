import apiClient from "@/lib/api-client";
import type {
  ProductType,
  CreateProductTypeInput,
  UpdateProductTypeInput,
} from "@/modules/product-types/types";

export async function apiGetProductTypes(productId?: string): Promise<ProductType[]> {
  const { data } = await apiClient.get<ProductType[]>("/product-types", {
    params: productId ? { productId } : undefined,
  });
  return data;
}

export async function apiGetProductType(id: string): Promise<ProductType> {
  const { data } = await apiClient.get<ProductType>(`/product-types/${id}`);
  return data;
}

export async function apiCreateProductType(
  input: CreateProductTypeInput
): Promise<ProductType> {
  const { data } = await apiClient.post<ProductType>("/product-types", input);
  return data;
}

export async function apiUpdateProductType(
  id: string,
  input: UpdateProductTypeInput
): Promise<ProductType> {
  const { data } = await apiClient.patch<ProductType>(`/product-types/${id}`, input);
  return data;
}

export async function apiDeleteProductType(id: string): Promise<void> {
  await apiClient.delete(`/product-types/${id}`);
}
