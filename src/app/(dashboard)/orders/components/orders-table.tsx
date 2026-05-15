"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Eye, Search } from "lucide-react";
import { DataTable, ServerPagination } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DiningBadge } from "@/components/shared/dining-badge";
import type { Order, OrderTransactionInput } from "@/modules/orders/types";
import {
  OrderStatusBadge,
  FinancialStatusBadge,
  FulfillmentStatusBadge,
} from "@/components/shared/order-status-badge";
import { OrderDetailSheet } from "./order-detail-sheet";
import { OrderCardPopup } from "@/app/(dashboard)/orders/restaurant/components/order-card";
import Big from "big.js";

function getColumns(
  onView: (order: Order) => void,
  onViewCard: (order: Order) => void,
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
      id: "takeNumber",
      header: "取餐號",
      cell: ({ row }) => `#${row.original.takeNumber}`,
      size: 70,
    },
    {
      id: "tableName",
      header: "桌位",
      cell: ({ row }) =>
        row.original.tableName ? (
          <Badge size="sm" variant="outline">
            {row.original.tableName}
          </Badge>
        ) : null,
      size: 60,
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
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7"
            onClick={() => onViewCard(row.original)}
          >
            <Search className="h-3.5 w-3.5" />
          </Button>
          <span>{dayjs(row.original.createdAt).format("YYYYMMDD-HHmmss")}</span>
        </div>
      ),
      size: 220,
    },
    {
      id: "payment",
      header: "交易方式",
      cell: ({ row }) => {
        const txns =
          (row.original.transactions as unknown as
            | OrderTransactionInput[]
            | null) ?? [];
        if (txns.length === 0) return null;
        return (
          <div className="flex flex-wrap gap-1">
            {txns.map((t, i) => (
              <Badge variant="third" size="sm" key={`${t.gateway.id}-${i}`}>
                {t.gateway.name} ${Number(t.amount)}
              </Badge>
            ))}
          </div>
        );
      },
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
        const orderDiscount = Big(Number(row.original.discount));
        const discount = orderDiscount.plus(lineItemDiscount);

        if (!discount.gt(0)) return "$0";

        const text = `-$${discount.toNumber()}`;
        if (!lineItemDiscount.gt(0)) return text;

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="underline cursor-help">{text}</span>
            </TooltipTrigger>
            <TooltipContent className="flex-col items-start gap-0.5">
              <p>商品折扣 ${lineItemDiscount.toNumber()}</p>
              <p>訂單折扣 ${orderDiscount.toNumber()}</p>
            </TooltipContent>
          </Tooltip>
        );
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
      cell: ({ row }) => <DiningBadge isDining={row.original.isDining} />,
    },
  ];
}

export function OrdersTable({
  data,
  isLoading,
  onUpdated,
  onDeleted,
  serverPagination,
  showDeleted,
}: {
  data: Order[];
  isLoading?: boolean;
  onUpdated: (order: Order) => void;
  onDeleted: (id: string) => void;
  serverPagination?: ServerPagination;
  showDeleted?: boolean;
}) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [cardOrder, setCardOrder] = useState<Order | null>(null);
  const [cardOpen, setCardOpen] = useState(false);

  function handleView(order: Order) {
    setSelectedOrderId(order.id);
    setSheetOpen(true);
  }

  function handleViewCard(order: Order) {
    setCardOrder(order);
    setCardOpen(true);
  }

  function handleCardUpdated(order: Order) {
    setCardOrder(order);
    onUpdated(order);
  }

  function handleCardDeleted(id: string) {
    setCardOpen(false);
    onDeleted(id);
  }

  return (
    <>
      <DataTable
        columns={getColumns(handleView, handleViewCard, onUpdated)}
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
        showDeleted={showDeleted}
      />

      {cardOrder && (
        <OrderCardPopup
          order={cardOrder}
          open={cardOpen}
          onOpenChange={setCardOpen}
          onUpdated={handleCardUpdated}
          onDeleted={handleCardDeleted}
          showDeleted={showDeleted}
        />
      )}
    </>
  );
}
