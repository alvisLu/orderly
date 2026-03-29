"use client";

import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Eye } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/modules/orders/types";
import {
  OrderStatusBadge,
  FinancialStatusBadge,
  FulfillmentStatusBadge,
} from "./order-status-badge";
import { EditOrderDialog } from "./edit-order-dialog";

function getColumns(
  onView: (order: Order) => void,
  onUpdated: (order: Order) => void
): ColumnDef<Order>[] {
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
      id: "createdAt",
      header: "訂單編號",
      size: 240,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7"
            onClick={() => onView(row.original)}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <EditOrderDialog order={row.original} onUpdated={onUpdated} />
          <span>{dayjs(row.original.createdAt).format("YYYYMMDD-HHmmss")}</span>
        </div>
      ),
    },
    {
      id: "items",
      header: "品項數",
      size: 80,
      cell: ({ row }) => `${row.original.lineItems.length} 項`,
    },
    {
      id: "total",
      header: "金額",
      size: 90,
      cell: ({ row }) => `$${Number(row.original.total)}`,
    },
    {
      id: "status",
      header: "訂單狀態",
      size: 110,
      cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
    },
    {
      id: "financialStatus",
      header: "付款",
      size: 90,
      cell: ({ row }) => (
        <FinancialStatusBadge status={row.original.financialStatus} />
      ),
    },
    {
      id: "fulfillmentStatus",
      header: "出餐",
      size: 90,
      cell: ({ row }) => (
        <FulfillmentStatusBadge status={row.original.fulfillmentStatus} />
      ),
    },
    {
      id: "type",
      header: "類型",
      size: 90,
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.isDining ? "用餐中" : "已離場"}
        </Badge>
      ),
    },
  ];
}

export function OrdersTable({
  data,
  isLoading,
  onView,
  onUpdated,
}: {
  data: Order[];
  isLoading?: boolean;
  onView: (order: Order) => void;
  onUpdated: (order: Order) => void;
}) {
  return (
    <DataTable
      columns={getColumns(onView, onUpdated)}
      data={data}
      pagination
      isLoading={isLoading}
    />
  );
}
