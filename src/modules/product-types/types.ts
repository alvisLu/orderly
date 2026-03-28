import type {
  ProductType as PrismaProductType,
  Product as PrismaProduct,
} from "@/generated/prisma/client";

export type ProductTypeItem = {
  name: string;
  price: number;
  isDefault: boolean;
  isDisable: boolean;
};

export type ProductType = Omit<PrismaProductType, "items"> & {
  items: ProductTypeItem[];
  products?: { product: PrismaProduct }[];
};

export type CreateProductTypeInput = {
  name: string;
  productIds?: string[];
  isDisable?: boolean;
  max?: number;
  min?: number;
  items?: ProductTypeItem[];
};

export type UpdateProductTypeInput = Partial<
  Omit<CreateProductTypeInput, "productId">
>;

export interface ProductTypeQuery {
  page: number;
  limit: number;
}

export interface PaginatedProductTypes {
  data: ProductType[];
  total: number;
  page: number;
  limit: number;
}
