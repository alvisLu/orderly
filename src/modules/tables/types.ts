import type { Table } from "@/generated/prisma/client";

export type { Table };

export type CreateTableInput = Pick<Table, "name" | "isActive">;
export type UpdateTableInput = Partial<Pick<Table, "name" | "isActive">>;

export interface TableQuery {
  page: number;
  limit: number;
}

export interface PaginatedTables {
  data: Table[];
  total: number;
  page: number;
  limit: number;
}
