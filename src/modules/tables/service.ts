import { TableNotFoundError } from "@/lib/http-error";
import {
  findAllTables,
  findTableById,
  insertTable,
  updateTable,
  deleteTable,
} from "./repository";
import type {
  Table,
  CreateTableInput,
  UpdateTableInput,
  TableQuery,
  PaginatedTables,
} from "./types";

export async function getTables(query: TableQuery): Promise<PaginatedTables> {
  return findAllTables(query);
}

export async function getTable(id: string): Promise<Table> {
  const t = await findTableById(id);
  if (!t) throw new TableNotFoundError();
  return t;
}

export async function createTable(input: CreateTableInput): Promise<Table> {
  return insertTable(input);
}

export async function editTable(
  id: string,
  input: UpdateTableInput
): Promise<Table> {
  const existing = await findTableById(id);
  if (!existing) throw new TableNotFoundError();
  const t = await updateTable(id, input);
  if (!t) throw new TableNotFoundError();
  return t;
}

export async function removeTable(id: string): Promise<void> {
  const t = await findTableById(id);
  if (!t) throw new TableNotFoundError();
  return deleteTable(id);
}
