"use client";

import { ColumnDef } from "@tanstack/react-table";
import dayjs from "@/lib/dayjs";
import { DataTable } from "@/components/shared/data-table";
import type { CheckoutTransactionRecord } from "@/modules/orders/types";

const columns: ColumnDef<CheckoutTransactionRecord>[] = [
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
    id: "takeNumber",
    header: "取餐號",
    cell: ({ row }) =>
      row.original.takeNumber != null ? `#${row.original.takeNumber}` : "-",
    size: 80,
  },
  {
    id: "orderNo",
    header: "訂單編號",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {dayjs(row.original.orderCreatedAt).format("YYYYMMDD-HHmmss")}
      </span>
    ),
    size: 170,
  },
  {
    id: "gateway",
    header: "金流",
    cell: ({ row }) => row.original.gateway?.name ?? "未知",
  },
  {
    id: "amount",
    header: "金額",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">${row.original.amount}</span>
    ),
    size: 120,
  },
];

interface Props {
  data: CheckoutTransactionRecord[];
  isLoading?: boolean;
}

export function CheckoutsTable({ data, isLoading }: Props) {
  return (
    <DataTable
      columns={columns}
      data={data}
      pagination
      isLoading={isLoading}
    />
  );
}
