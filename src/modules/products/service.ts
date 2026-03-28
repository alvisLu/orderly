import {
  findAllProducts,
  findProductById,
  insertProduct,
  updateProduct,
  deleteProduct,
} from "./repository";
import type {
  CreateProductInput,
  Product,
  ProductQuery,
  UpdateProductInput,
} from "./types";
import { ProductNotFoundError } from "@/lib/http-error";

export async function getProducts(query: ProductQuery): Promise<Product[]> {
  return findAllProducts(query);
}

export async function getProduct(id: string): Promise<Product> {
  const p = await findProductById(id);
  if (!p) throw new ProductNotFoundError();
  return p;
}

export async function createProduct(
  newP: CreateProductInput
): Promise<Product> {
  return insertProduct(newP);
}

export async function editProduct(
  id: string,
  input: UpdateProductInput
): Promise<Product> {
  const p = await updateProduct(id, input);
  if (!p) throw new ProductNotFoundError();
  return p;
}

export async function removeProduct(id: string): Promise<void> {
  const p = await findProductById(id);
  if (!p) throw new ProductNotFoundError();

  return deleteProduct(id);
}
