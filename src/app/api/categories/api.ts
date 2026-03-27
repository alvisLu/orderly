import apiClient from "@/lib/api-client";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/modules/categories/types";

export async function apiGetCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>("/categories");
  return data;
}

export async function apiGetCategory(id: string): Promise<Category> {
  const { data } = await apiClient.get<Category>(`/categories/${id}`);
  return data;
}

export async function apiCreateCategory(
  input: CreateCategoryInput
): Promise<Category> {
  const { data } = await apiClient.post<Category>("/categories", input);
  return data;
}

export async function apiUpdateCategory(
  id: string,
  input: UpdateCategoryInput
): Promise<Category> {
  const { data } = await apiClient.patch<Category>(`/categories/${id}`, input);
  return data;
}

export async function apiDeleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}

export async function apiReorderCategories(
  categories: { id: string; rank: number }[]
): Promise<void> {
  await apiClient.post("/categories/reorder", { categories });
}
