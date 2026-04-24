import { prisma } from "@/lib/prisma";
import { DatabaseError } from "@/lib/http-error";
import Big from "big.js";
import type {
  Expenses,
  CreateExpenseInput,
  ExpenseQuery,
  PaginatedExpenses,
  UpdateExpenseInput,
} from "./types";

export async function findAllExpenses(
  query: ExpenseQuery
): Promise<PaginatedExpenses> {
  const { sort = "desc", page, limit, from, to } = query;
  const skip = Big(page - 1)
    .times(limit)
    .toNumber();
  const where = {
    ...((from || to) && {
      expendAt: {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
      },
    }),
  };
  try {
    const [rows, total] = await Promise.all([
      prisma.expenses.findMany({
        where,
        orderBy: { expendAt: sort },
        skip,
        take: limit,
      }),
      prisma.expenses.count({ where }),
    ]);
    return { data: rows, total, page, limit };
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function findExpenseById(id: string): Promise<Expenses | null> {
  try {
    return await prisma.expenses.findUnique({ where: { id } });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function insertExpense(
  input: CreateExpenseInput
): Promise<Expenses> {
  try {
    return await prisma.expenses.create({ data: input });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function updateExpense(
  id: string,
  input: UpdateExpenseInput
): Promise<Expenses> {
  try {
    return await prisma.expenses.update({ where: { id }, data: input });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function deleteExpense(id: string): Promise<void> {
  try {
    await prisma.expenses.delete({ where: { id } });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}
