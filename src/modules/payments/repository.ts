import { prisma } from "@/lib/prisma";
import { DatabaseError } from "@/lib/http-error";
import type { Payment, CreatePaymentInput, UpdatePaymentInput } from "./types";

export async function findAllPayments(): Promise<Payment[]> {
  try {
    return await prisma.payment.findMany({ orderBy: { rank: "asc" } });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function findPaymentById(id: string): Promise<Payment | null> {
  try {
    return await prisma.payment.findUnique({ where: { id } });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function insertPayment(input: CreatePaymentInput): Promise<Payment> {
  try {
    return await prisma.payment.create({ data: input });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function findPaymentByIds(ids: string[]): Promise<Payment[]> {
  try {
    return await prisma.payment.findMany({ where: { id: { in: ids } } });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function updatePayment(
  id: string,
  input: UpdatePaymentInput
): Promise<Payment | null> {
  try {
    return await prisma.payment.update({ where: { id }, data: input });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function updatePaymentRankBy(
  id: string,
  rank: number
): Promise<Payment | null> {
  return updatePayment(id, { rank });
}

export async function deletePayment(id: string): Promise<void> {
  try {
    await prisma.payment.delete({ where: { id } });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}
