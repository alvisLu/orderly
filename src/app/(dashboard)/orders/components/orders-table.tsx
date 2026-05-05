"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Eye } from "lucide-react";
import { DataTable, ServerPagination } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DiningBadge } from "@/components/shared/dining-badge";
import type { Order } from "@/modules/orders/types";
import {
  OrderStatusBadge,
  FinancialStatusBadge,
  FulfillmentStatusBadge,
} from "@/components/shared/order-status-badge";
import { OrderDetailSheet } from "./order-detail-sheet";
import Big from "big.js";

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
          <span>{dayjs(row.original.createdAt).format("YYYYMMDD-HHmmss")}</span>
        </div>
      ),
      size: 190,
    },
    {
      id: "total",
      header: "金額",
      cell: ({ row }) => `$${Number(row.original.total)}`,
    },
    {
      id: "discount",
      header: "折扣",
      cell: ({ row }) => {
        const lineItemDiscount = row.original.lineItems.reduce(
          (sum, item) =>
            sum.plus(
              item.originalPrice
                ? Big(Number(item.originalPrice))
                    .minus(Number(item.price))
                    .times(item.quantity)
                : 0
            ),
          Big(0)
        );
        const discount = Big(Number(row.original.discount)).plus(
          lineItemDiscount
        );

        return discount.gt(0) ? `-$${discount.toNumber()}` : "$0";
      },
    },
    {
      id: "status",
      header: "訂單狀態",
      cell: ({ row }) => (
        <OrderStatusBadge
          status={row.original.status}
          deletedAt={row.original.deletedAt}
        />
      ),
    },
    {
      id: "financialStatus",
      header: "付款",
      cell: ({ row }) => (
        <FinancialStatusBadge status={row.original.financialStatus} />
      ),
    },
    {
      id: "fulfillmentStatus",
      header: "出餐",
      cell: ({ row }) => (
        <FulfillmentStatusBadge status={row.original.fulfillmentStatus} />
      ),
    },
    {
      id: "type",
      header: "類型",
      cell: ({ row }) => (
        <DiningBadge isDining={row.original.isDining} />
      ),
    },
  ];
}

export function OrdersTable({
  data,
  isLoading,
  onUpdated,
  onDeleted,
  serverPagination,
}: {
  data: Order[];
  isLoading?: boolean;
  onUpdated: (order: Order) => void;
  onDeleted: (id: string) => void;
  serverPagination?: ServerPagination;
}) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  function handleView(order: Order) {
    setSelectedOrderId(order.id);
    setSheetOpen(true);
  }

  return (
    <>
      <DataTable
        columns={getColumns(handleView, onUpdated)}
        data={data}
        pagination
        isLoading={isLoading}
        serverPagination={serverPagination}
      />

      <OrderDetailSheet
        orderId={selectedOrderId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUpdated={onUpdated}
        onDeleted={onDeleted}
      />
    </>
  );
}
