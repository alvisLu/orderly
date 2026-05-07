import apiClient from "@/lib/api-client";
import type {
  CreateMoneyCountInput,
  MoneyCount,
  MoneyCountQuery,
  PaginatedMoneyCounts,
} from "@/modules/money-counts/types";

export async function apiGetMoneyCounts(
  query?: Partial<MoneyCountQuery>
): Promise<PaginatedMoneyCounts> {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.sort) params.set("sort", query.sort);
  if (query?.from) params.set("from", query.from.toISOString());
  if (query?.to) params.set("to", query.to.toISOString());
  const { data } = await apiClient.get<PaginatedMoneyCounts>(
    `/money-counts?${params}`
  );
  return data;
}

export async function apiGetMoneyCount(id: string): Promise<MoneyCount> {
  const { data } = await apiClient.get<MoneyCount>(`/money-counts/${id}`);
  return data;
}

export async function apiCreateMoneyCount(
  input: CreateMoneyCountInput
): Promise<MoneyCount> {
  const { data } = await apiClient.post<MoneyCount>("/money-counts", input);
  return data;
}

export async function apiDeleteMoneyCount(id: string): Promise<void> {
  await apiClient.delete(`/money-counts/${id}`);
}
