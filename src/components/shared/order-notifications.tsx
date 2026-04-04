"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { useRealtimeStatus } from "@/store/realtime-status";

const SOURCE_LABEL: Record<string, string> = {
  online: "線上訂單",
  qrcode: "QR Code 訂單",
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function OrderNotifications() {
  const { setStatus, setRetryCount } = useRealtimeStatus();

  useEffect(() => {
    const authClient = createClient();

    let realtimeClient: ReturnType<typeof createSupabaseClient> | null = null;
    let cleanup = () => {};

    authClient.auth.getSession().then(({ data: { session } }) => {
      // console.log(
      //   "[OrderNotifications] token:",
      //   session?.access_token?.slice(0, 30)
      // );
      if (!session) return;

      realtimeClient = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        realtime: { params: { apikey: SUPABASE_ANON_KEY } },
      });
      realtimeClient.realtime.setAuth(session.access_token);

      let retryTimeout: ReturnType<typeof setTimeout>;
      let retryCount = 0;

      const channel = realtimeClient
        .channel("order-notifications")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "orders" },
          (payload) => {
            console.log("[OrderNotifications] payload:", payload);
            const source = payload.new.source as string;
            if (source === "store") return;

            const label = SOURCE_LABEL[source];
            toast.info(`新${label} `, {
              description: `新訂單`,
              duration: 8000,
            });
          }
        )
        .subscribe((status, err) => {
          console.log("[OrderNotifications] status:", status, err);
          if (status === "SUBSCRIBED") {
            setStatus("connected");
            retryCount = 0;
            setRetryCount(0);
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            setStatus("error");
            const delay = Math.min(1000 * 2 ** retryCount, 30000);
            console.log(`[OrderNotifications] retry #${retryCount + 1} in ${delay}ms`);
            retryTimeout = setTimeout(async () => {
              retryCount++;
              setRetryCount(retryCount);
              const { data: { session: newSession } } = await authClient.auth.getSession();
              if (!newSession) {
                console.log("[OrderNotifications] session expired, stop retrying");
                setStatus("error");
                return;
              }
              realtimeClient!.realtime.setAuth(newSession.access_token);
              channel.subscribe();
            }, delay);
          } else if (status === "CLOSED") setStatus("closed");
        });

      cleanup = () => {
        clearTimeout(retryTimeout);
        realtimeClient!.removeChannel(channel);
      };
    });

    return () => cleanup();
  }, [setStatus, setRetryCount]);

  return null;
}
