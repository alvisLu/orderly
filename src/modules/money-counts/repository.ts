import { prisma } from "@/lib/prisma";
import { DatabaseError } from "@/lib/http-error";
import Big from "big.js";
import type {
  MoneyCount as PrismaMoneyCount,
  Prisma,
} from "@/generated/prisma/client";
import type {
  CreateMoneyCountInput,
  CurrencyEntry,
  MoneyCount,
  MoneyCountQuery,
  PaginatedMoneyCounts,
} from "./types";

function normalizeCurrencies(value: Prisma.JsonValue | null): CurrencyEntry[] {
  if (!Array.isArray(value)) return [];
  return value as unknown as CurrencyEntry[];
}

function normalize(row: PrismaMoneyCount): MoneyCount {
  return { ...row, currencies: normalizeCurrencies(row.currencies) };
}

export async function findAllMoneyCounts(
  query: MoneyCountQuery
): Promise<PaginatedMoneyCounts> {
  const { sort = "desc", page, limit, from, to } = query;
  const skip = Big(page - 1)
    .times(limit)
    .toNumber();
  const where = {
    ...((from || to) && {
      createdAt: {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
      },
    }),
  };
  try {
    const [rows, total] = await Promise.all([
      prisma.moneyCount.findMany({
        where,
        orderBy: { createdAt: sort },
        skip,
        take: limit,
      }),
      prisma.moneyCount.count({ where }),
    ]);
    return { data: rows.map(normalize), total, page, limit };
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function findMoneyCountById(
  id: string
): Promise<MoneyCount | null> {
  try {
    const row = await prisma.moneyCount.findUnique({ where: { id } });
    return row ? normalize(row) : null;
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function insertMoneyCount(
  input: CreateMoneyCountInput
): Promise<MoneyCount> {
  try {
    const row = await prisma.moneyCount.create({
      data: {
        currencies: (input.currencies ?? []) as unknown as Prisma.InputJsonValue,
      },
    });
    return normalize(row);
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function deleteMoneyCount(id: string): Promise<void> {
  try {
    await prisma.moneyCount.delete({ where: { id } });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}
