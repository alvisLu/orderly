"use client";

import { useEffect, useState, useTransition } from "react";
import { apiGetOrders } from "@/app/api/orders/api";
import type { Order } from "@/modules/orders/types";
import type { OrderStatus } from "@/generated/prisma/client";
import { OrdersTable } from "./components/orders-table";
import { CreateOrderDialog } from "./components/create-order-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const STATUS_TABS: { label: string; value: OrderStatus | undefined }[] = [
  { label: "全部", value: undefined },
  { label: "待處理", value: "pending" },
  { label: "處理中", value: "processing" },
  { label: "完成", value: "done" },
  { label: "已取消", value: "cancelled" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, startLoading] = useTransition();
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const [showDeleted, setShowDeleted] = useState(false);
  useEffect(() => {
    startLoading(async () => {
      const res = await apiGetOrders({
        status,
        page: pageIndex + 1,
        limit: pageSize,
        showDeleted,
      });
      setOrders(res.data);
      setTotal(res.total);
    });
  }, [status, pageIndex, pageSize, showDeleted]);

  function handleUpdated(updated: Order) {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }

  function handleDeleted(id: string) {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">訂單列表</h1>
        <CreateOrderDialog
          onCreated={(o) => setOrders((prev) => [o, ...prev])}
        />
      </div>

      <div className="flex gap-2 mb-4">
        {STATUS_TABS.map((tab) => (
          <Button
            key={String(tab.value)}
            variant={status === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatus(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
        <div className="flex items-center gap-2">
          <Checkbox
            id="showDeleted"
            checked={showDeleted}
            onCheckedChange={(checked) => {
              setShowDeleted(!!checked);
              setPageIndex(0);
            }}
          />
          <Label htmlFor="showDeleted" className="text-sm cursor-pointer">
            顯示已刪除
          </Label>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <OrdersTable
          data={orders}
          isLoading={isLoading}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
          serverPagination={{
            total,
            pageIndex,
            pageSize,
            onPageChange: setPageIndex,
            onPageSizeChange: (size: number) => {
              setPageSize(size);
              setPageIndex(0);
            },
          }}
        />
      </div>
    </div>
  );
}
