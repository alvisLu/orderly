import { prisma } from "@/lib/prisma";
import { DatabaseError } from "@/lib/http-error";
import type {
  ProductType,
  CreateProductTypeInput,
  UpdateProductTypeInput,
} from "./types";

export async function findAllProductTypes(
  productId?: string
): Promise<ProductType[]> {
  try {
    return await prisma.productType.findMany({
      where: productId ? { productIds: { has: productId } } : undefined,
      orderBy: { createdAt: "asc" },
    });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function findProductTypeById(
  id: string
): Promise<ProductType | null> {
  try {
    return await prisma.productType.findUnique({ where: { id } });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function insertProductType(
  input: CreateProductTypeInput
): Promise<ProductType> {
  try {
    return await prisma.productType.create({ data: input });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function updateProductType(
  id: string,
  input: UpdateProductTypeInput
): Promise<ProductType | null> {
  try {
    return await prisma.productType.update({ where: { id }, data: input });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function deleteProductType(id: string): Promise<void> {
  try {
    await prisma.productType.delete({ where: { id } });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}
