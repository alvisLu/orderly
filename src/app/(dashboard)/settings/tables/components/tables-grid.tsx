"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCode, QRCodeSkeleton, QRCodeSvg } from "@/components/ui/qr-code";
import { Scroller } from "@/components/ui/scroller";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import type { ServerPagination } from "@/components/shared/data-table";
import type { Table } from "@/modules/tables/types";
import { EditableTableName } from "./editable-table-name";
import { ToggleTableField } from "./toggle-table-field";

const HOST = process.env.NEXT_PUBLIC_HOST ?? "";

function buildMenuUrl(tableName: string) {
  return `${HOST}/menu?t=${encodeURIComponent(tableName)}`;
}

interface Props {
  data: Table[];
  isLoading?: boolean;
  onUpdated: (table: Table) => void;
  onDelete: (id: string) => void;
  serverPagination: ServerPagination;
}

export function TablesGrid({
  data,
  isLoading,
  onUpdated,
  onDelete,
  serverPagination,
}: Props) {
  const { pageSize } = serverPagination;

  return (
    <div className="h-full flex flex-col gap-2">
      <Scroller className="flex-1 min-h-0">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: pageSize }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            沒有桌位
          </div>
        ) : (
          <div className="grid grid-cols-1 p-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {data.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                onUpdated={onUpdated}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </Scroller>
    </div>
  );
}

interface TableCardProps {
  table: Table;
  onUpdated: (table: Table) => void;
  onDelete: (id: string) => void;
}

function TableCard({ table, onUpdated, onDelete }: TableCardProps) {
  const url = buildMenuUrl(table.name);
  const [namePending, setNamePending] = useState(false);
  const [togglePending, setTogglePending] = useState(false);
  const isUpdating = namePending || togglePending;

  return (
    <Card size="sm" className="relative">
      {isUpdating && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-[1px]"
          aria-busy="true"
          aria-live="polite"
        >
          <Spinner className="size-18 text-muted-foreground" />
        </div>
      )}
      <CardHeader>
        <CardTitle>
          <EditableTableName
            tableId={table.id}
            name={table.name}
            onUpdated={onUpdated}
            onPendingChange={setNamePending}
          />
        </CardTitle>
        <CardAction>
          <Button
            variant="ghost"
            size="icon-xl"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(table.id)}
          >
            <Trash2 className="size-5" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        {HOST ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`開啟 ${table.name} 點餐頁`}
            className="rounded-md transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <QRCode value={url} size={280} level="M" margin={1}>
              <QRCodeSkeleton className="rounded-md" />
              <QRCodeSvg />
            </QRCode>
          </a>
        ) : (
          <div className="text-xs text-muted-foreground">
            未設定 NEXT_PUBLIC_HOST
          </div>
        )}
        <div className="flex w-full items-center justify-between border-t pt-3">
          <span className="text-sm text-muted-foreground">啟用</span>
          <ToggleTableField
            tableId={table.id}
            checked={table.isActive}
            onUpdated={onUpdated}
          />
        </div>
      </CardContent>
    </Card>
  );
}
