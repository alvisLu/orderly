import {
  CategoryAlreadyExistsError,
  CategoryMaxCountReachedError,
  CategoryNotFoundError,
} from "@/lib/http-error";
import {
  findAllCategories,
  findCategoryById,
  insertCategory,
  updateCategory,
  deleteCategory,
  findCategoryByIds,
  updateCategoryRankBy,
  findCategoryByName,
  getCategoriesCount,
} from "./repository";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./types";

export async function getCategories(): Promise<Category[]> {
  return findAllCategories();
}

export async function getCategory(id: string): Promise<Category> {
  const c = await findCategoryById(id);
  if (!c) throw new CategoryNotFoundError();
  return c;
}

export async function createCategory(
  input: CreateCategoryInput
): Promise<Category> {
  const count = await getCategoriesCount();
  if (count >= 50) {
    throw new CategoryMaxCountReachedError();
  }
  const exist = await findCategoryByName(input.name);
  if (exist) {
    throw new CategoryAlreadyExistsError();
  }

  return insertCategory(input);
}

export async function editCategory(
  id: string,
  input: UpdateCategoryInput
): Promise<Category> {
  const c = await updateCategory(id, input);
  if (!c) throw new CategoryNotFoundError();
  return c;
}

export async function reorderCategories(
  categories: { id: string; rank: number }[]
): Promise<void> {
  const ids = categories.map((c) => c.id);
  const existCategories = await findCategoryByIds(ids);

  if (existCategories.length !== categories.length) {
    throw new CategoryNotFoundError();
  }

  await Promise.all(
    categories.map((c) => {
      return updateCategoryRankBy(c.id, c.rank);
    })
  );
}

export async function removeCategory(id: string): Promise<void> {
  const c = await findCategoryById(id);
  if (!c) throw new CategoryNotFoundError();
  return deleteCategory(id);
}
