"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import { ArrowLeft, Clock, RefreshCw } from "lucide-react";
import dayjs from "dayjs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { LineItemOption, Order } from "@/modules/orders/types";
import { getMyOrderIds } from "../storage";
import { Badge } from "@/components/ui/badge";
import { DiningBadge } from "@/components/shared/dining-badge";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { Label } from "@/components/ui/label";

export function OrderHistory({ onBack }: { onBack: () => void }) {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    const ids = getMyOrderIds();
    if (ids.length === 0) {
      startTransition(() => setOrders([]));
      return;
    }
    const res = await fetch(`/api/menu/orders?ids=${ids.join(",")}`);
    const data = res.ok ? await res.json() : [];
    setOrders(data);
  }, []);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await fetchOrders();
    } finally {
      setRefreshing(false);
    }
  };

  const loading = orders === null;

  return (
    <div className="flex flex-col h-dvh bg-primary/5">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 flex items-center gap-3 bg-background border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <p className="text-xl font-semibold flex-1">我的訂單</p>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing || loading}
          aria-label="重新整理"
        >
          <RefreshCw
            className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
          />
          重新整理
        </Button>
      </div>

      {/* Order list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner className="size-6 text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-center text-muted-foreground py-10 text-lg">
            目前沒有訂單
          </p>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="space-y-3">
                {/* Order header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    {order.takeNumber && (
                      <Badge>取餐號 #{order.takeNumber}</Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <DiningBadge isDining={order.isDining} />
                    <OrderStatusBadge
                      status={order.status}
                      deletedAt={order.deletedAt}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="w-4 h-4" />
                  <span>
                    {dayjs(order.createdAt).format("YYYY-MM-DD HH:mm")}
                  </span>
                </div>
                {/* Line items */}
                <div className="space-y-1.5 border-b pb-1 ">
                  {order.lineItems.map((item) => {
                    const options = (item.itemOptions ??
                      []) as unknown as LineItemOption[];
                    return (
                      <div
                        key={item.id}
                        className="flex justify-between text-base"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-muted-foreground ml-1">
                            x{item.quantity}
                          </span>
                          {options.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                              {options.map((o) => o.name).join("、")}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 font-medium">
                          ${Number(item.price) * item.quantity}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Order note */}
                <p className="h-20 text-sm text-muted-foreground border border-border rounded-md px-3 py-2">
                  <Label>備註:</Label>
                  {order.userNote}
                </p>

                {/* Total */}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>小計</span>
                  <span>${Number(order.total)}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Back button */}
      <div className="px-4 py-2.5">
        <Button size="xl" className="w-full" onClick={onBack}>
          繼續點餐
        </Button>
      </div>
    </div>
  );
}
