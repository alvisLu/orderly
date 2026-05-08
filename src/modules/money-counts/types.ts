import type { MoneyCount as PrismaMoneyCount } from "@/generated/prisma/client";

export type CurrencyDenomination =
  | 1
  | 5
  | 10
  | 50
  | 100
  | 200
  | 500
  | 1000;

export interface CurrencyEntry {
  denomination: CurrencyDenomination;
  count: number;
}

export type MoneyCount = Omit<PrismaMoneyCount, "currencies"> & {
  currencies: CurrencyEntry[];
};

export interface CreateMoneyCountInput {
  currencies?: CurrencyEntry[];
}

export interface MoneyCountQuery {
  sort?: "asc" | "desc";
  page: number;
  limit: number;
  from?: Date;
  to?: Date;
}

export interface PaginatedMoneyCounts {
  data: MoneyCount[];
  total: number;
  page: number;
  limit: number;
}
