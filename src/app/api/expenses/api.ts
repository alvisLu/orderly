import apiClient from "@/lib/api-client";
import type {
  CreateExpenseInput,
  ExpenseQuery,
  Expenses,
  PaginatedExpenses,
  UpdateExpenseInput,
} from "@/modules/expenses/types";

export async function apiGetExpenses(
  query?: Partial<ExpenseQuery>
): Promise<PaginatedExpenses> {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.sort) params.set("sort", query.sort);
  if (query?.from) params.set("from", query.from.toISOString());
  if (query?.to) params.set("to", query.to.toISOString());
  const { data } = await apiClient.get<PaginatedExpenses>(
    `/expenses?${params}`
  );
  return data;
}

export async function apiGetExpense(id: string): Promise<Expenses> {
  const { data } = await apiClient.get<Expenses>(`/expenses/${id}`);
  return data;
}

export async function apiCreateExpense(
  input: CreateExpenseInput
): Promise<Expenses> {
  const { data } = await apiClient.post<Expenses>("/expenses", input);
  return data;
}

export async function apiUpdateExpense(
  id: string,
  input: UpdateExpenseInput
): Promise<Expenses> {
  const { data } = await apiClient.patch<Expenses>(`/expenses/${id}`, input);
  return data;
}

export async function apiDeleteExpense(id: string): Promise<void> {
  await apiClient.delete(`/expenses/${id}`);
}
