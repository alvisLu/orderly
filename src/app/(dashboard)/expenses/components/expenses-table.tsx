"use client";

import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Pencil, Trash2 } from "lucide-react";
import { DataTable, ServerPagination } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import type { Expenses } from "@/modules/expenses/types";

function getColumns(
  onEdit: (expense: Expenses) => void,
  onDelete: (expense: Expenses) => void
): ColumnDef<Expenses>[] {
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
      id: "expendAt",
      header: "日期",
      cell: ({ row }) => dayjs(row.original.expendAt).format("YYYY-MM-DD"),
      size: 120,
    },
    {
      id: "expendType",
      header: "類型",
      cell: ({ row }) => row.original.expendType ?? "-",
    },
    {
      id: "payMethod",
      header: "付款方式",
      cell: ({ row }) => row.original.payMethod ?? "-",
    },
    {
      id: "price",
      header: "金額",
      cell: ({ row }) => `$${Number(row.original.price)}`,
    },
    {
      id: "reimburse",
      header: "代墊",
      cell: ({ row }) => row.original.reimburse ?? "-",
    },
    {
      id: "description",
      header: "備註",
      cell: ({ row }) => (
        <span className="line-clamp-1">{row.original.description ?? "-"}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      size: 90,
    },
  ];
}

interface Props {
  data: Expenses[];
  isLoading?: boolean;
  onEdit: (expense: Expenses) => void;
  onDelete: (expense: Expenses) => void;
  serverPagination?: ServerPagination;
}

export function ExpensesTable({
  data,
  isLoading,
  onEdit,
  onDelete,
  serverPagination,
}: Props) {
  return (
    <DataTable
      columns={getColumns(onEdit, onDelete)}
      data={data}
      pagination
      isLoading={isLoading}
      serverPagination={serverPagination}
    />
  );
}
