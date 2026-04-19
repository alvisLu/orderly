import { ExpenseNotFoundError } from "@/lib/http-error";
import {
  deleteExpense,
  findAllExpenses,
  findExpenseById,
  insertExpense,
  updateExpense,
} from "./repository";
import type {
  CreateExpenseInput,
  ExpenseQuery,
  Expenses,
  PaginatedExpenses,
  UpdateExpenseInput,
} from "./types";

export async function getExpenses(
  query: ExpenseQuery
): Promise<PaginatedExpenses> {
  return findAllExpenses(query);
}

export async function getExpense(id: string): Promise<Expenses> {
  const e = await findExpenseById(id);
  if (!e) throw new ExpenseNotFoundError();
  return e;
}

export async function createExpense(
  input: CreateExpenseInput
): Promise<Expenses> {
  return insertExpense(input);
}

export async function editExpense(
  id: string,
  input: UpdateExpenseInput
): Promise<Expenses> {
  const e = await updateExpense(id, input);
  if (!e) throw new ExpenseNotFoundError();
  return e;
}

export async function removeExpense(id: string): Promise<void> {
  const e = await findExpenseById(id);
  if (!e) throw new ExpenseNotFoundError();
  return deleteExpense(id);
}
