import type { Expenses } from "@/generated/prisma/client";

export type { Expenses };

export type CreateExpenseInput = {
  reimburse?: string | null;
  expendType?: string | null;
  payMethod?: string | null;
  price?: number;
  description?: string | null;
  expendAt?: Date;
};

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

export interface ExpenseQuery {
  sort?: "asc" | "desc";
  page: number;
  limit: number;
  from?: Date;
  to?: Date;
}

export interface PaginatedExpenses {
  data: Expenses[];
  total: number;
  page: number;
  limit: number;
}
