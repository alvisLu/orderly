import type { ProductType as PrismaProductType } from "@/generated/prisma/client";

export type ProductTypeItem = {
  name: string;
  price: number;
  isDefault: boolean;
  isDisable: boolean;
};

export type ProductType = Omit<PrismaProductType, "items"> & {
  items: ProductTypeItem[];
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
