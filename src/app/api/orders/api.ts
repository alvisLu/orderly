import apiClient from "@/lib/api-client";
import type {
  CreateOrderInput,
  DailyGatewayStats,
  DailyGatewayStatsQuery,
  Order,
  OrderQuery,
  OrdersReport,
  OrdersReportQuery,
  PaginatedOrders,
  UpdateOrderInput,
} from "@/modules/orders/types";

export async function apiGetOrders(
  query?: Partial<OrderQuery>
): Promise<PaginatedOrders> {
  const params = new URLSearchParams();
  if (query?.status) params.set("status", query.status);
  if (query?.isDining !== undefined)
    params.set("isDining", String(query.isDining));
  if (query?.sort) params.set("sort", query.sort);
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.showDeleted) params.set("showDeleted", "true");
  if (query?.from) params.set("from", query.from.toISOString());
  if (query?.to) params.set("to", query.to.toISOString());
  const { data } = await apiClient.get<PaginatedOrders>(`/orders?${params}`);
  return data;
}

export async function apiPollOrders(from: Date): Promise<PaginatedOrders> {
  const params = new URLSearchParams({ from: from.toISOString() });
  const { data } = await apiClient.get<PaginatedOrders>(
    `/orders/poll?${params}`
  );
  return data;
}

export async function apiGetOrdersReport(
  query?: Partial<OrdersReportQuery>
): Promise<OrdersReport> {
  const params = new URLSearchParams();
  if (query?.showDeleted) params.set("showDeleted", "true");
  if (query?.from) params.set("from", query.from.toISOString());
  if (query?.to) params.set("to", query.to.toISOString());
  const { data } = await apiClient.get<OrdersReport>(`/orders/report?${params}`);
  return data;
}

export async function apiGetDailyGatewayStats(
  query: DailyGatewayStatsQuery
): Promise<DailyGatewayStats> {
  const params = new URLSearchParams({
    from: query.from.toISOString(),
    to: query.to.toISOString(),
  });
  if (query.showDeleted) params.set("showDeleted", "true");
  const { data } = await apiClient.get<DailyGatewayStats>(
    `/orders/stats/daily?${params}`
  );
  return data;
}

export async function apiGetOrder(id: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/orders/${id}`);
  return data;
}

export async function apiCreateOrder(input: CreateOrderInput): Promise<Order> {
  const { data } = await apiClient.post<Order>("/orders", input);
  return data;
}

export async function apiUpdateOrder(
  id: string,
  input: UpdateOrderInput
): Promise<Order> {
  const { data } = await apiClient.patch<Order>(`/orders/${id}`, input);
  return data;
}

export async function apiDeleteOrder(id: string): Promise<void> {
  await apiClient.delete(`/orders/${id}`);
}

export async function apiLeaveAllDining(): Promise<{ count: number }> {
  const { data } = await apiClient.post<{ count: number }>("/orders/leave-all");
  return data;
}
