import { MoneyCountNotFoundError } from "@/lib/http-error";
import {
  deleteMoneyCount,
  findAllMoneyCounts,
  findMoneyCountById,
  insertMoneyCount,
} from "./repository";
import type {
  CreateMoneyCountInput,
  MoneyCount,
  MoneyCountQuery,
  PaginatedMoneyCounts,
} from "./types";

export async function getMoneyCounts(
  query: MoneyCountQuery
): Promise<PaginatedMoneyCounts> {
  return findAllMoneyCounts(query);
}

export async function getMoneyCount(id: string): Promise<MoneyCount> {
  const row = await findMoneyCountById(id);
  if (!row) throw new MoneyCountNotFoundError();
  return row;
}

export async function createMoneyCount(
  input: CreateMoneyCountInput
): Promise<MoneyCount> {
  return insertMoneyCount(input);
}

export async function removeMoneyCount(id: string): Promise<void> {
  await getMoneyCount(id);
  return deleteMoneyCount(id);
}
