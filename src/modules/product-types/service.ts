import { ProductTypeNotFoundError } from "@/lib/http-error";
import {
  findAllProductTypes,
  findProductTypeById,
  insertProductType,
  updateProductType,
  deleteProductType,
} from "./repository";
import type {
  ProductType,
  CreateProductTypeInput,
  UpdateProductTypeInput,
} from "./types";

export async function getProductTypes(productId?: string): Promise<ProductType[]> {
  return findAllProductTypes(productId);
}

export async function getProductType(id: string): Promise<ProductType> {
  const pt = await findProductTypeById(id);
  if (!pt) throw new ProductTypeNotFoundError();
  return pt;
}

export async function createProductType(
  input: CreateProductTypeInput
): Promise<ProductType> {
  return insertProductType(input);
}

export async function editProductType(
  id: string,
  input: UpdateProductTypeInput
): Promise<ProductType> {
  const pt = await findProductTypeById(id);
  if (!pt) throw new ProductTypeNotFoundError();
  const updated = await updateProductType(id, input);
  if (!updated) throw new ProductTypeNotFoundError();
  return updated;
}

export async function removeProductType(id: string): Promise<void> {
  const pt = await findProductTypeById(id);
  if (!pt) throw new ProductTypeNotFoundError();
  return deleteProductType(id);
}
