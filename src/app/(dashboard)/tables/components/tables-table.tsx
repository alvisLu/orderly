"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import type { ServerPagination } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import type { Table } from "@/modules/tables/types";
import { EditTableDialog } from "./edit-table-dialog";
import { ToggleTableField } from "./toggle-table-field";

function getColumns(
  onUpdated: (table: Table) => void,
  onDelete: (id: string) => void
): ColumnDef<Table>[] {
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
      header: "桌位名稱",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <EditTableDialog table={row.original} onUpdated={onUpdated} />
          <span>{row.getValue<string>("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "狀態",
      cell: ({ row }) => (
        <ToggleTableField
          tableId={row.original.id}
          checked={row.getValue("isActive")}
          onUpdated={onUpdated}
        />
      ),
      size: 80,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => onDelete(row.original.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ),
      size: 40,
    },
  ];
}

interface Props {
  data: Table[];
  isLoading?: boolean;
  onUpdated: (table: Table) => void;
  onDelete: (id: string) => void;
  serverPagination?: ServerPagination;
}

export function TablesTable({ data, isLoading, onUpdated, onDelete, serverPagination }: Props) {
  return (
    <DataTable
      columns={getColumns(onUpdated, onDelete)}
      data={data}
      pagination
      isLoading={isLoading}
      serverPagination={serverPagination}
    />
  );
}
