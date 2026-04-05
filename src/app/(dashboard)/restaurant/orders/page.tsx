"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { apiGetOrders, apiGetOrder } from "@/app/api/orders/api";
import type { Order } from "@/modules/orders/types";
import type { OrderStatus } from "@/generated/prisma/client";
import { OrderCard } from "./components/order-card";
import { CreateOrderDialog } from "./components/create-order-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Scroller } from "@/components/ui/scroller";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const STATUS_TABS: { label: string; value: OrderStatus | undefined }[] = [
  { label: "全部", value: undefined },
  { label: "待處理", value: "pending" },
  { label: "處理中", value: "processing" },
  { label: "完成", value: "done" },
  { label: "已取消", value: "cancelled" },
];

export default function RestaurantOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, startLoading] = useTransition();
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);

  useEffect(() => {
    startLoading(async () => {
      const res = await apiGetOrders({
        status,
        page: pageIndex + 1,
        limit: pageSize,
      });
      setOrders(res.data);
      setTotal(res.total);
    });
  }, [status, pageIndex, pageSize]);

  // Realtime: auto-insert new orders
  const statusRef = useCallback(() => status, [status]);
  const pageIndexRef = useCallback(() => pageIndex, [pageIndex]);

  useEffect(() => {
    const authClient = createClient();
    let realtimeClient: ReturnType<typeof createSupabaseClient> | null = null;
    let cleanup = () => {};

    authClient.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;

      realtimeClient = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        realtime: { params: { apikey: SUPABASE_ANON_KEY } },
      });
      realtimeClient.realtime.setAuth(session.access_token);

      const channel = realtimeClient
        .channel("restaurant-orders")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "orders" },
          async (payload) => {
            const newOrderStatus = payload.new.status as OrderStatus;
            const currentStatus = statusRef();
            // Only add if on first page and status filter matches
            if (pageIndexRef() !== 0) return;
            if (currentStatus && newOrderStatus !== currentStatus) return;

            try {
              const fullOrder = await apiGetOrder(payload.new.id as string);
              setOrders((prev) => {
                if (prev.some((o) => o.id === fullOrder.id)) return prev;
                return [fullOrder, ...prev];
              });
              setTotal((t) => t + 1);
            } catch {
              // order may have been deleted before we could fetch
            }
          }
        )
        .subscribe();

      cleanup = () => {
        realtimeClient!.removeChannel(channel);
      };
    });

    return () => cleanup();
  }, [statusRef, pageIndexRef]);

  function handleUpdated(updated: Order) {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }

  function handleDeleted(id: string) {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">餐廳訂單</h1>
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
            onClick={() => {
              setStatus(tab.value);
              setPageIndex(0);
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <Scroller className="flex-1 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner className="size-10 text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            沒有訂單
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > pageSize && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Button
              variant="outline"
              size="sm"
              disabled={pageIndex === 0}
              onClick={() => setPageIndex((p) => p - 1)}
            >
              上一頁
            </Button>
            <span className="text-sm text-muted-foreground">
              {pageIndex + 1} / {Math.ceil(total / pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={(pageIndex + 1) * pageSize >= total}
              onClick={() => setPageIndex((p) => p + 1)}
            >
              下一頁
            </Button>
          </div>
        )}
      </Scroller>
    </div>
  );
}
