"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import type { Product, ProductQuery } from "@/modules/products/types";
import type { Category } from "@/modules/categories/types";
import type { ProductType } from "@/modules/product-types/types";
import { apiGetProducts } from "@/app/api/products/api";
import { apiGetCategories } from "@/app/api/categories/api";
import { apiGetProductTypes } from "@/app/api/product-types/api";
import { ProductsTable } from "./products-table";
import { CreateProductDialog } from "./create-product-dialog";
import { SearchProduct } from "./searech-product";

export function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, startLoading] = useTransition();
  const [categories, setCategories] = useState<Category[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);

  useEffect(() => {
    apiGetCategories().then(setCategories);
    apiGetProductTypes().then((res) => setProductTypes(res.data));
  }, []);

  useEffect(() => {
    const query: Partial<ProductQuery> = {
      search: searchParams.get("search") ?? undefined,
      category_id: searchParams.get("category_id") ?? undefined,
      is_favorite:
        searchParams.get("is_favorite") === "true" ? true : undefined,
      sort_by: (searchParams.get("sort_by") === "name"
        ? "name"
        : "created_at") as ProductQuery["sort_by"],
      sort_order: (searchParams.get("sort_order") === "desc"
        ? "desc"
        : "asc") as ProductQuery["sort_order"],
      page: pageIndex + 1,
      limit: pageSize,
    };
    startLoading(async () => {
      const res = await apiGetProducts(query);
      setProducts(res.data);
      setTotal(res.total);
    });
  }, [searchParams, pageIndex, pageSize]);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">商品列表</h1>
        <CreateProductDialog
          categories={categories}
          productTypes={productTypes}
        />
      </div>
      <SearchProduct categories={categories} />
      <div className="flex-1 min-h-0">
        <ProductsTable
          data={products}
          isLoading={isLoading}
          categories={categories}
          productTypes={productTypes}
          serverPagination={{
            total,
            pageIndex,
            pageSize,
            onPageChange: setPageIndex,
            onPageSizeChange: (size: number) => {
              setPageSize(size);
              setPageIndex(0);
            },
          }}
        />
      </div>
    </div>
  );
}
