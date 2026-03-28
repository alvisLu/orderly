import { prisma } from "@/lib/prisma";
import { DatabaseError } from "@/lib/http-error";
import type {
  CreateProductInput,
  Product,
  ProductQuery,
  UpdateProductInput,
} from "./types";

const sortByMap = {
  created_at: "createdAt",
  name: "name",
} as const;

const include = { category: true } as const;

export async function findAllProducts(
  query: ProductQuery = {}
): Promise<Product[]> {
  const {
    search,
    is_favorite,
    sort_by = "created_at",
    sort_order = "asc",
  } = query;

  try {
    return await prisma.product.findMany({
      where: {
        ...(search && { name: { contains: search, mode: "insensitive" } }),
        ...(is_favorite !== undefined && { isFavorite: is_favorite }),
      },
      orderBy: { [sortByMap[sort_by]]: sort_order },
      include,
    });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function findProductById(id: string): Promise<Product | null> {
  try {
    return await prisma.product.findUnique({ where: { id }, include });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function insertProduct(
  input: CreateProductInput
): Promise<Product> {
  try {
    return await prisma.product.create({ data: input, include });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput
): Promise<Product | null> {
  try {
    return await prisma.product.update({ where: { id }, data: input, include });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await prisma.product.delete({ where: { id } });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}
