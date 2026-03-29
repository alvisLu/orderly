import { PaymentNotFoundError } from "@/lib/http-error";
import {
  findAllPayments,
  findPaymentById,
  findPaymentByIds,
  insertPayment,
  updatePayment,
  updatePaymentRankBy,
  deletePayment,
} from "./repository";
import type { Payment, CreatePaymentInput, UpdatePaymentInput } from "./types";

export async function getPayments(): Promise<Payment[]> {
  return findAllPayments();
}

export async function getPayment(id: string): Promise<Payment> {
  const p = await findPaymentById(id);
  if (!p) throw new PaymentNotFoundError();
  return p;
}

export async function createPayment(input: CreatePaymentInput): Promise<Payment> {
  return insertPayment(input);
}

export async function editPayment(
  id: string,
  input: UpdatePaymentInput
): Promise<Payment> {
  const existing = await findPaymentById(id);
  if (!existing) throw new PaymentNotFoundError();
  const p = await updatePayment(id, input);
  if (!p) throw new PaymentNotFoundError();
  return p;
}

export async function reorderPayments(
  payments: { id: string; rank: number }[]
): Promise<void> {
  const ids = payments.map((p) => p.id);
  const existing = await findPaymentByIds(ids);

  if (existing.length !== payments.length) {
    throw new PaymentNotFoundError();
  }

  await Promise.all(payments.map((p) => updatePaymentRankBy(p.id, p.rank)));
}

export async function removePayment(id: string): Promise<void> {
  const p = await findPaymentById(id);
  if (!p) throw new PaymentNotFoundError();
  return deletePayment(id);
}
