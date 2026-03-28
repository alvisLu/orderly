"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { apiGetProductTypes } from "@/app/api/product-types/api";
import { apiGetProducts } from "@/app/api/products/api";
import type { ProductType } from "@/modules/product-types/types";
import type { Product } from "@/modules/products/types";
import { ProductTypesTable } from "./components/product-types-table";
import { CreateProductTypeDialog } from "./components/create-product-type-dialog";

export default function ProductTypesPage() {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, startLoading] = useTransition();

  useEffect(() => {
    startLoading(async () => {
      const [productsRes, productTypesRes] = await Promise.all([
        apiGetProducts().catch(() => { toast.error("載入商品失敗"); return null; }),
        apiGetProductTypes().catch(() => { toast.error("載入商品選項失敗"); return null; }),
      ]);
      if (productsRes) setProducts(productsRes.data);
      if (productTypesRes) setProductTypes(productTypesRes.data);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">商品選項</h1>
      <div className="flex items-center justify-between mb-4">
        <div />
        <CreateProductTypeDialog
          products={products}
          onCreated={(pt) => setProductTypes((prev) => [pt, ...prev])}
        />
      </div>
      <ProductTypesTable
        data={productTypes}
        isLoading={isLoading}
        products={products}
        onUpdated={(updated) =>
          setProductTypes((prev) =>
            prev.map((pt) => (pt.id === updated.id ? updated : pt))
          )
        }
        onDeleted={(id) =>
          setProductTypes((prev) => prev.filter((pt) => pt.id !== id))
        }
      />
    </div>
  );
}
