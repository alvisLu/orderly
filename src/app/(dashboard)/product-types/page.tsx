"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    apiGetProducts().then((res) => setProducts(res.data)).catch(() => toast.error("載入商品失敗"));
    apiGetProductTypes().then((res) => setProductTypes(res.data)).catch(() => toast.error("載入規格失敗"));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">規格管理</h1>
      <div className="flex items-center justify-between mb-4">
        <div />
        <CreateProductTypeDialog
          products={products}
          onCreated={(pt) => setProductTypes((prev) => [pt, ...prev])}
        />
      </div>
      <ProductTypesTable
        data={productTypes}
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
