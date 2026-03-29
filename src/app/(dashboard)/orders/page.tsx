"use client";

import { useEffect, useState, useTransition } from "react";
import { apiGetOrders } from "@/app/api/orders/api";
import type { Order } from "@/modules/orders/types";
import type { OrderStatus } from "@/generated/prisma/client";
import { OrdersTable } from "./components/orders-table";
import { OrderDetailSheet } from "./components/order-detail-sheet";
import { CreateOrderDialog } from "./components/create-order-dialog";
import { Button } from "@/components/ui/button";

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
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    startLoading(async () => {
      const res = await apiGetOrders({ status, page: 1, limit: 100 });
      setOrders(res.data);
    });
  }, [status]);

  function handleView(order: Order) {
    setSelectedOrder(order);
    setSheetOpen(true);
  }

  function handleUpdated(updated: Order) {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setSelectedOrder(updated);
  }

  function handleDeleted(id: string) {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setSelectedOrder(null);
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">訂單列表</h1>
        <CreateOrderDialog onCreated={(o) => setOrders((prev) => [o, ...prev])} />
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
      </div>

      <div className="flex-1 min-h-0">
        <OrdersTable
          data={orders}
          isLoading={isLoading}
          onView={handleView}
          onUpdated={handleUpdated}
        />
      </div>

      <OrderDetailSheet
        order={selectedOrder}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
