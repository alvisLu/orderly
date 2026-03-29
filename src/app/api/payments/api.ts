import apiClient from "@/lib/api-client";
import type { Payment, CreatePaymentInput, UpdatePaymentInput } from "@/modules/payments/types";

export async function apiGetPayments(): Promise<Payment[]> {
  const { data } = await apiClient.get<Payment[]>("/payments");
  return data;
}

export async function apiGetPayment(id: string): Promise<Payment> {
  const { data } = await apiClient.get<Payment>(`/payments/${id}`);
  return data;
}

export async function apiCreatePayment(input: CreatePaymentInput): Promise<Payment> {
  const { data } = await apiClient.post<Payment>("/payments", input);
  return data;
}

export async function apiUpdatePayment(
  id: string,
  input: UpdatePaymentInput
): Promise<Payment> {
  const { data } = await apiClient.patch<Payment>(`/payments/${id}`, input);
  return data;
}

export async function apiDeletePayment(id: string): Promise<void> {
  await apiClient.delete(`/payments/${id}`);
}

export async function apiReorderPayments(
  payments: { id: string; rank: number }[]
): Promise<void> {
  await apiClient.post("/payments/reorder", { payments });
}
