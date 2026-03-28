import { prisma } from "@/lib/prisma";
import { DatabaseError } from "@/lib/http-error";
import type {
  ProductType,
  ProductTypeQuery,
  PaginatedProductTypes,
  CreateProductTypeInput,
  UpdateProductTypeInput,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProductType(raw: any): ProductType {
  return raw as ProductType;
}

export async function findAllProductTypes(
  query: ProductTypeQuery
): Promise<PaginatedProductTypes> {
  const { page, limit } = query;
  const skip = (page - 1) * limit;
  try {
    const [rows, total] = await prisma.$transaction([
      prisma.productType.findMany({ orderBy: { createdAt: "asc" }, skip, take: limit }),
      prisma.productType.count(),
    ]);
    return { data: rows.map(toProductType), total, page, limit };
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function findProductTypeById(
  id: string
): Promise<ProductType | null> {
  try {
    const row = await prisma.productType.findUnique({
      where: { id },
      include: { products: { include: { product: true } } },
    });
    return row ? toProductType(row) : null;
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function insertProductType(
  input: CreateProductTypeInput
): Promise<ProductType> {
  const { productIds, ...data } = input;
  try {
    const row = await prisma.productType.create({
      data: {
        ...data,
        ...(productIds?.length && {
          products: {
            create: productIds.map((productId) => ({ productId })),
          },
        }),
      },
    });
    return toProductType(row);
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function updateProductType(
  id: string,
  input: UpdateProductTypeInput
): Promise<ProductType | null> {
  try {
    const row = await prisma.productType.update({ where: { id }, data: input });
    return toProductType(row);
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
