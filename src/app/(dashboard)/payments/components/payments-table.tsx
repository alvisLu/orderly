"use client";

import { Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Payment } from "@/modules/payments/types";
import { EditPaymentDialog } from "./edit-payment-dialog";
import { TogglePaymentField } from "./toggle-payment-field";

const PAYMENT_TYPE_LABEL: Record<string, string> = {
  cash: "現金",
  custom: "自訂付款",
};

function getColumns(
  onUpdated: (payment: Payment) => void,
  onDelete: (id: string) => void
): ColumnDef<Payment>[] {
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
      header: "名稱",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <EditPaymentDialog payment={row.original} onUpdated={onUpdated} />
          <span>{row.getValue<string>("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "類型",
      cell: ({ row }) => (
        <Badge variant="secondary">
          {PAYMENT_TYPE_LABEL[row.getValue<string>("type")]}
        </Badge>
      ),
      size: 80,
    },
    {
      accessorKey: "isPosAvailable",
      header: "櫃檯啟用",
      cell: ({ row }) => (
        <TogglePaymentField
          paymentId={row.original.id}
          field="isPosAvailable"
          checked={row.getValue("isPosAvailable")}
          onUpdated={onUpdated}
        />
      ),
      size: 100,
    },
    {
      accessorKey: "isMenuAvailable",
      header: "線上啟用",
      cell: ({ row }) => (
        <TogglePaymentField
          paymentId={row.original.id}
          field="isMenuAvailable"
          checked={row.getValue("isMenuAvailable")}
          onUpdated={onUpdated}
        />
      ),
      size: 100,
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

export function PaymentsTable({
  data,
  isLoading,
  onUpdated,
  onDelete,
}: {
  data: Payment[];
  isLoading?: boolean;
  onUpdated: (payment: Payment) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <DataTable
      columns={getColumns(onUpdated, onDelete)}
      data={data}
      isLoading={isLoading}
    />
  );
}
