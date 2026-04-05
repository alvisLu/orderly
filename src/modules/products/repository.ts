import { prisma } from "@/lib/prisma";
import { DatabaseError } from "@/lib/http-error";
import type {
  CreateProductInput,
  PaginatedProducts,
  Product,
  ProductQuery,
  UpdateProductInput,
} from "./types";

const sortByMap = {
  created_at: "createdAt",
  name: "name",
} as const;

const include = {
  category: true,
  productTypes: { include: { productType: true } },
} as const;

export async function findAllProducts(
  query: ProductQuery
): Promise<PaginatedProducts> {
  const {
    search,
    category_id,
    is_favorite,
    sort_by = "created_at",
    sort_order = "desc",
    page,
    limit,
  } = query;
  const skip = (page - 1) * limit;

  const where = {
    ...(search && { name: { contains: search, mode: "insensitive" as const } }),
    ...(category_id && { categoryId: category_id }),
    ...(is_favorite !== undefined && { isFavorite: is_favorite }),
  };

  try {
    const [rows, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy: { [sortByMap[sort_by]]: sort_order },
        skip,
        take: limit,
        include,
      }),
      prisma.product.count({
        where,
      }),
    ]);
    return { data: rows, total, page, limit };
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
  const { productTypeIds, ...data } = input;
  try {
    return await prisma.product.create({
      data: {
        ...data,
        ...(productTypeIds?.length && {
          productTypes: {
            create: productTypeIds.map((productTypeId) => ({ productTypeId })),
          },
        }),
      },
      include,
    });
  } catch (e) {
    throw new DatabaseError(String(e));
  }
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput
): Promise<Product | null> {
  const { productTypeIds, ...data } = input;
  try {
    return await prisma.$transaction(async (tx) => {
      if (productTypeIds !== undefined) {
        await tx.productToProductType.deleteMany({ where: { productId: id } });
        if (productTypeIds.length > 0) {
          await tx.productToProductType.createMany({
            data: productTypeIds.map((productTypeId) => ({
              productId: id,
              productTypeId,
            })),
          });
        }
      }
      return tx.product.update({ where: { id }, data, include });
    });
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
