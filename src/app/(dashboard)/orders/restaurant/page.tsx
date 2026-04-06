"use client";

import { useEffect, useState, useTransition, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { apiGetOrders, apiGetOrder } from "@/app/api/orders/api";
import type { Order } from "@/modules/orders/types";
import { OrderColumns } from "./components/order-columns";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Scroller } from "@/components/ui/scroller";

const PAGE_SIZE = 5;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const STATUS_TABS: {
  label: string;
  value: "pending" | "processing" | "done" | undefined;
}[] = [
  { label: "全部", value: undefined },
  { label: "待處理", value: "pending" },
  { label: "處理中", value: "processing" },
  { label: "完成", value: "done" },
];

export default function RestaurantOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, startLoading] = useTransition();
  const [isLoadingMore, startLoadingMore] = useTransition();
  const [hasMore, setHasMore] = useState(true);
  const [status, setStatus] = useState<
    "pending" | "processing" | "done" | undefined
  >(undefined);
  const pageRef = useRef(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Initial load & status change
  useEffect(() => {
    pageRef.current = 1;
    startLoading(async () => {
      const res = await apiGetOrders({ status, page: 1, limit: PAGE_SIZE });
      setOrders(res.data);
      setHasMore(res.data.length >= PAGE_SIZE);
    });
  }, [status]);

  // Load more
  function loadMore() {
    if (!hasMore || isLoadingMore) return;
    const nextPage = pageRef.current + 1;
    startLoadingMore(async () => {
      const res = await apiGetOrders({
        status,
        page: nextPage,
        limit: PAGE_SIZE,
      });
      pageRef.current = nextPage;
      setOrders((prev) => {
        const existingIds = new Set(prev.map((o) => o.id));
        const newOrders = res.data.filter((o) => !existingIds.has(o.id));
        return [...prev, ...newOrders];
      });
      setHasMore(res.data.length >= PAGE_SIZE);
    });
  }

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  });

  // Realtime: auto-insert new orders
  const statusRef = useCallback(() => status, [status]);

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
            const newOrderStatus = payload.new.status as string;
            const currentStatus = statusRef();
            if (currentStatus && newOrderStatus !== currentStatus) return;

            try {
              const fullOrder = await apiGetOrder(payload.new.id as string);
              setOrders((prev) => {
                if (prev.some((o) => o.id === fullOrder.id)) return prev;
                return [fullOrder, ...prev];
              });
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
  }, [statusRef]);

  function handleUpdated(updated: Order) {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }

  function handleDeleted(id: string) {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
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
          <>
            <OrderColumns
              orders={orders}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
            {/* Sentinel for infinite scroll */}
            {hasMore && (
              <div
                ref={sentinelRef}
                className="flex items-center justify-center py-6"
              >
                {isLoadingMore && (
                  <Spinner className="size-8 text-muted-foreground" />
                )}
              </div>
            )}
          </>
        )}
      </Scroller>
    </div>
  );
}
