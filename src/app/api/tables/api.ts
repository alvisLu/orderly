import apiClient from "@/lib/api-client";
import type {
  Table,
  CreateTableInput,
  UpdateTableInput,
  TableQuery,
  PaginatedTables,
} from "@/modules/tables/types";

export async function apiGetTables(query?: Partial<TableQuery>): Promise<PaginatedTables> {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  const { data } = await apiClient.get<PaginatedTables>(`/tables?${params}`);
  return data;
}

export async function apiCreateTable(input: CreateTableInput): Promise<Table> {
  const { data } = await apiClient.post<Table>("/tables", input);
  return data;
}

export async function apiUpdateTable(
  id: string,
  input: UpdateTableInput
): Promise<Table> {
  const { data } = await apiClient.patch<Table>(`/tables/${id}`, input);
  return data;
}

export async function apiDeleteTable(id: string): Promise<void> {
  await apiClient.delete(`/tables/${id}`);
}
