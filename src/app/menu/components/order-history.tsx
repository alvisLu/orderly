"use client";

import { useState, useEffect, startTransition } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import dayjs from "dayjs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { LineItemOption, Order } from "@/modules/orders/types";
import { getMyOrderIds } from "../storage";

const STATUS_LABELS: Record<string, string> = {
  pending: "訂單已送出",
  processing: "製作中",
  done: "完成",
  cancelled: "已取消",
};

export function OrderHistory({ onBack }: { onBack: () => void }) {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    const ids = getMyOrderIds();
    if (ids.length === 0) {
      startTransition(() => setOrders([]));
      return;
    }
    let cancelled = false;
    fetch(`/api/menu/orders?ids=${ids.join(",")}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setOrders(data);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = orders === null;

  return (
    <div className="flex flex-col h-dvh bg-primary/5">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 flex items-center gap-3 bg-background border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <p className="text-xl font-semibold flex-1">我的訂單</p>
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
                    <Clock className="w-4 h-4" />
                    <span>
                      {dayjs(order.createdAt).format("YYYY-MM-DD HH:mm")}
                    </span>
                  </div>
                  <span className="text-sm font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>

                {/* Line items */}
                <div className="space-y-1.5">
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
                {order.userNote && (
                  <p className="text-sm text-muted-foreground">
                    備註：{order.userNote}
                  </p>
                )}

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
