"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import type { ProductType } from "@/modules/product-types/types";
import type { ProductTypeItem } from "@/modules/product-types/types";
import { EditProductTypeDialog } from "./edit-product-type-dialog";

function getColumns(
  onUpdated: (pt: ProductType) => void,
  onDeleted: (id: string) => void
): ColumnDef<ProductType>[] {
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
      accessorKey: "name",
      header: "規格名稱",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <EditProductTypeDialog
            productType={row.original}
            onUpdated={onUpdated}
            onDeleted={onDeleted}
          />
          <span>{row.getValue<string>("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "min",
      header: "必選",
      cell: ({ row }) => {
        const max = row.getValue("max");
        return `最少選 ${max} 項`;
      },
    },
    {
      accessorKey: "max",
      header: "多選",
      cell: ({ row }) => {
        const max = row.getValue("max");
        return `最多選 ${max} 項`;
      },
    },
    {
      accessorKey: "length",
      header: "種類",
      cell: ({ row }) => {
        const items = row.getValue<ProductTypeItem[]>("items");
        return `共 ${items.length} 項`;
      },
    },
    {
      accessorKey: "items",
      header: "選項/價格",
      cell: ({ row }) => {
        const items = row.getValue<ProductTypeItem[]>("items");
        if (!items?.length)
          return <span className="text-muted-foreground">-</span>;
        return (
          <div className="flex flex-col gap-0.5">
            {items.map((item, i) => (
              <span key={i} className="text-sm">
                {item.name}
                {item.price > 0 && (
                  <span className="text-muted-foreground"> +${item.price}</span>
                )}
              </span>
            ))}
          </div>
        );
      },
    },
  ];
}

interface Props {
  data: ProductType[];
  onUpdated: (pt: ProductType) => void;
  onDeleted: (id: string) => void;
}

export function ProductTypesTable({ data, onUpdated, onDeleted }: Props) {
  return (
    <DataTable
      columns={getColumns(onUpdated, onDeleted)}
      data={data}
      pagination
    />
  );
}
