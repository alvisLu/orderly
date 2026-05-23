"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "@/lib/dayjs";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { OrderDetailSheet } from "@/app/(dashboard)/orders/components/order-detail-sheet";
import type { CheckoutTransactionRecord } from "@/modules/orders/types";
import { Badge } from "@/components/ui/badge";

interface Props {
  data: CheckoutTransactionRecord[];
  isLoading?: boolean;
}

export function CheckoutsTable({ data, isLoading }: Props) {
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<CheckoutTransactionRecord>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.index + 1}</span>
        ),
        size: 40,
      },
      {
        id: "date",
        header: "時間",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {dayjs(row.original.date).format("YYYY-MM-DD HH:mm")}
          </span>
        ),
        size: 160,
      },
      {
        id: "amount",
        header: "金額",
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">
            ${row.original.amount}
          </span>
        ),
        size: 120,
      },
      {
        id: "gateway",
        header: "付款方式",
        cell: ({ row }) => (
          <Badge>{row.original.gateway?.name ?? "未知"}</Badge>
        ),
      },
      {
        id: "view",
        header: "查看訂單",
        cell: ({ row }) => (
          <Button
            size="icon"
            variant="secondary"
            onClick={() => setOpenOrderId(row.original.orderId)}
            aria-label="查看訂單"
          >
            <Search className="size-4" />
          </Button>
        ),
        size: 48,
      },
    ],
    []
  );

  return (
    <>
      <DataTable columns={columns} data={data} isLoading={isLoading} />
      <OrderDetailSheet
        orderId={openOrderId}
        open={openOrderId !== null}
        onOpenChange={(open) => !open && setOpenOrderId(null)}
      />
    </>
  );
}
