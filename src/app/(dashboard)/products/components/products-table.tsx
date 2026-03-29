"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { DataTable } from "../../../../components/shared/data-table";
import type { ServerPagination } from "@/components/shared/data-table";
import type { Product } from "@/modules/products/types";
import type { Category } from "@/modules/categories/types";
import type { ProductType } from "@/modules/product-types/types";
import { EditProductDialog } from "./edit-product-dialog";
import { ToggleProductField } from "./toggle-product-field";
import { Badge } from "@/components/ui/badge";

function getColumns(
  categories: Category[],
  productTypes: ProductType[]
): ColumnDef<Product>[] {
  return [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.index + 1}</span>
      ),
      size: 40,
    },
    {
      id: "image",
      header: "照片",
      cell: ({ row }) => {
        const url = row.original.imageUrls?.[0];
        return url ? (
          <Image
            src={url}
            alt={row.original.name}
            width={48}
            height={48}
            className="rounded object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded bg-muted" />
        );
      },
      size: 64,
    },
    {
      accessorKey: "name",
      header: "商品名稱",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <EditProductDialog
            product={row.original}
            categories={categories}
            productTypes={productTypes}
          />
          <span>{row.getValue<string>("name")}</span>
        </div>
      ),
    },
    {
      id: "category",
      header: "目錄",
      cell: ({ row }) =>
        row.original.category?.name ? (
          <Badge variant="outline">
            {row.original.category?.name ?? "未分類"}
          </Badge>
        ) : (
          <Badge variant="destructive">
            {row.original.category?.name ?? "未分類"}
          </Badge>
        ),
    },
    {
      accessorKey: "isPosAvailable",
      header: "POS 上架",
      cell: ({ row }) => (
        <ToggleProductField
          productId={row.original.id}
          field="isPosAvailable"
          checked={row.getValue("isPosAvailable")}
        />
      ),
    },
    {
      accessorKey: "isMenuAvailable",
      header: "菜單上架",
      cell: ({ row }) => (
        <ToggleProductField
          productId={row.original.id}
          field="isMenuAvailable"
          checked={row.getValue("isMenuAvailable")}
        />
      ),
    },
    {
      accessorKey: "price",
      header: "價格",
      cell: ({ row }) => row.getValue<number>("price"),
    },
    {
      accessorKey: "cost",
      header: "成本",
      cell: ({ row }) => row.getValue<number>("cost"),
    },
    {
      accessorKey: "isFavorite",
      header: "我的最愛",
      cell: ({ row }) => (
        <ToggleProductField
          productId={row.original.id}
          field="isFavorite"
          checked={row.getValue("isFavorite")}
        />
      ),
    },
  ];
}

interface Props {
  data: Product[];
  categories: Category[];
  productTypes: ProductType[];
  isLoading?: boolean;
  serverPagination?: ServerPagination;
}

export function ProductsTable({
  data,
  categories,
  productTypes,
  isLoading,
  serverPagination,
}: Props) {
  return (
    <DataTable
      columns={getColumns(categories, productTypes)}
      data={data}
      pagination
      isLoading={isLoading}
      serverPagination={serverPagination}
    />
  );
}
