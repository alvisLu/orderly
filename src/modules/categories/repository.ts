import { prisma } from "@/lib/prisma";
import { DatabaseError } from "@/lib/http-error";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./types";

export async function getCategoriesCount(): Promise<number> {
  try {
    return await prisma.category.count();
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function findAllCategories(): Promise<Category[]> {
  try {
    return await prisma.category.findMany({ orderBy: { rank: "asc" } });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function findCategoryById(id: string): Promise<Category | null> {
  try {
    return await prisma.category.findUnique({ where: { id } });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function findCategoryByName(
  name: string
): Promise<Category | null> {
  try {
    return await prisma.category.findUnique({ where: { name } });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function findCategoryByIds(ids: string[]): Promise<Category[]> {
  try {
    return await prisma.category.findMany({ where: { id: { in: ids } } });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function insertCategory(
  input: CreateCategoryInput
): Promise<Category> {
  try {
    return await prisma.category.create({ data: input });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput
): Promise<Category | null> {
  try {
    return await prisma.category.update({ where: { id }, data: input });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function updateCategoryRankBy(
  id: string,
  rank: number
): Promise<Category | null> {
  return updateCategory(id, { rank });
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await prisma.category.delete({ where: { id } });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}
