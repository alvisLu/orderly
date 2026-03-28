"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product, ProductQuery } from "@/modules/products/types";
import type { Category } from "@/modules/categories/types";
import type { ProductType } from "@/modules/product-types/types";
import { apiGetProducts } from "@/app/api/products/api";
import { apiGetCategories } from "@/app/api/categories/api";
import { apiGetProductTypes } from "@/app/api/product-types/api";
import { ProductsTable } from "./components/products-table";
import { CreateProductDialog } from "./components/create-product-dialog";
import { SearchProduct } from "./components/searech-product";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);

  useEffect(() => {
    apiGetCategories().then(setCategories);
    apiGetProductTypes().then((res) => setProductTypes(res.data));
  }, []);

  useEffect(() => {
    const query: Partial<ProductQuery> = {
      search: searchParams.get("search") ?? undefined,
      is_favorite:
        searchParams.get("is_favorite") === "true" ? true : undefined,
      sort_by: (searchParams.get("sort_by") === "name"
        ? "name"
        : "created_at") as ProductQuery["sort_by"],
      sort_order: (searchParams.get("sort_order") === "desc"
        ? "desc"
        : "asc") as ProductQuery["sort_order"],
    };
    apiGetProducts(query).then((res) => setProducts(res.data));
  }, [searchParams]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">商品管理</h1>
      <div className="flex items-center justify-between mb-4">
        <SearchProduct />
        <CreateProductDialog categories={categories} productTypes={productTypes} />
      </div>
      <ProductsTable data={products} categories={categories} productTypes={productTypes} />
    </div>
  );
}
