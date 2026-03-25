import { findAllProducts, findProductById, insertProduct, updateProduct, deleteProduct } from './repository'
import type { CreateProductInput, Product, ProductQuery, UpdateProductInput } from './types'

export async function getProducts(query?: ProductQuery): Promise<Product[]> {
  return findAllProducts(query)
}

export async function getProduct(id: string): Promise<Product | null> {
  return findProductById(id)
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  return insertProduct(input)
}

export async function editProduct(id: string, input: UpdateProductInput): Promise<Product | null> {
  return updateProduct(id, input)
}

export async function removeProduct(id: string): Promise<void> {
  return deleteProduct(id)
}
