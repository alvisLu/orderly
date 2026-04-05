import { prisma } from "@/lib/prisma";
import { DatabaseError } from "@/lib/http-error";
import type {
  Table,
  CreateTableInput,
  UpdateTableInput,
  TableQuery,
  PaginatedTables,
} from "./types";

export async function findAllTables(
  query: TableQuery
): Promise<PaginatedTables> {
  const { page, limit } = query;
  const skip = (page - 1) * limit;

  try {
    const [rows, total] = await prisma.$transaction([
      prisma.table.findMany({
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.table.count(),
    ]);
    return { data: rows, total, page, limit };
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function findTableById(id: string): Promise<Table | null> {
  try {
    return await prisma.table.findUnique({ where: { id } });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function insertTable(input: CreateTableInput): Promise<Table> {
  try {
    return await prisma.table.create({ data: input });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function updateTable(
  id: string,
  input: UpdateTableInput
): Promise<Table | null> {
  try {
    return await prisma.table.update({ where: { id }, data: input });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function deleteTable(id: string): Promise<void> {
  try {
    await prisma.table.delete({ where: { id } });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}
