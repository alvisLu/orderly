"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { apiGetOrders, apiLeaveAllDining } from "@/app/api/orders/api";
import type { Order } from "@/modules/orders/types";
import { useNewOrdersStore } from "@/store/new-orders";
import { OrderColumns } from "./components/order-columns";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Scroller } from "@/components/ui/scroller";

const PAGE_SIZE = 5;

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
      const res = await apiGetOrders({
        status,
        isDining: true,
        sort: "asc",
        page: 1,
        limit: PAGE_SIZE,
      });
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
        isDining: true,
        sort: "asc",
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

  // Auto-insert new orders pushed by OrderPollingNotifications
  const newOrdersVersion = useNewOrdersStore((s) => s.version);
  const newOrdersBatch = useNewOrdersStore((s) => s.batch);

  useEffect(() => {
    if (newOrdersBatch.length === 0) return;
    setOrders((prev) => {
      const seen = new Set(prev.map((o) => o.id));
      const additions = newOrdersBatch.filter(
        (o) =>
          !seen.has(o.id) &&
          o.isDining &&
          (status === undefined || o.status === status)
      );
      return additions.length > 0 ? [...prev, ...additions] : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newOrdersVersion]);

  function handleUpdated(updated: Order) {
    setOrders((prev) =>
      updated.isDining
        ? prev.map((o) => (o.id === updated.id ? updated : o))
        : prev.filter((o) => o.id !== updated.id)
    );
  }

  function handleDeleted(id: string) {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <div className="px-2 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 px-2">
        {STATUS_TABS.map((tab) => (
          <Button
            key={String(tab.value)}
            variant={status === tab.value ? "default" : "outline"}
            size="lg"
            onClick={() => setStatus(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
        <div className="flex-1" />
        <Button
          variant="destructive"
          size="lg"
          disabled={orders.length === 0}
          onClick={async () => {
            try {
              const { count } = await apiLeaveAllDining();
              setOrders([]);
              toast.success(`已將 ${count} 筆訂單離場`);
            } catch {
              toast.error("操作失敗");
            }
          }}
        >
          全部離場
        </Button>
      </div>

      <Scroller className="flex-1 min-h-0 px-2">
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
