"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { apiPollOrders } from "@/app/api/orders/api";
import { useNewOrdersStore } from "@/store/new-orders";

const POLL_INTERVAL_MS =
  Number(process.env.NEXT_PUBLIC_ORDER_POLL_INTERVAL_MS) || 20_000;
const SOURCE_LABEL: Record<string, string> = {
  online: "線上",
  qrcode: "QR",
};

export function OrderPollingNotifications() {
  const publish = useNewOrdersStore((s) => s.publish);
  const lastSeenRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (lastSeenRef.current === null) {
      lastSeenRef.current = Date.now();
    }

    const tick = async () => {
      const since = lastSeenRef.current ?? Date.now();
      try {
        const { data } = await apiPollOrders(new Date(since));
        if (cancelled) return;

        const fresh = data.filter(
          (o) => new Date(o.createdAt).getTime() > since
        );
        if (fresh.length === 0) return;

        lastSeenRef.current = fresh.reduce<number>((max, o) => {
          const created = new Date(o.createdAt).getTime();
          return created > max ? created : max;
        }, since);

        for (const o of fresh) {
          if (!o.source || o.source === "store") continue;
          const label = SOURCE_LABEL[o.source] ?? "新訂單";
          toast.info(
            `${label} 新訂單, 取號: ${o.takeNumber}, 桌號: ${o.tableName}`,
            {
              duration: 8000,
            }
          );
        }

        publish(fresh);
      } catch (error) {
        console.error("[OrderPollingNotifications] poll failed", error);
      }
    };

    const stop = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };

    const loop = async () => {
      await tick();
      if (!cancelled && document.visibilityState === "visible") {
        timeoutId = setTimeout(loop, POLL_INTERVAL_MS);
      }
    };

    const onVisibility = () => {
      if (cancelled) return;
      stop();
      if (document.visibilityState === "visible") {
        loop();
      }
    };

    if (document.visibilityState === "visible") {
      timeoutId = setTimeout(loop, POLL_INTERVAL_MS);
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [publish]);

  return null;
}
