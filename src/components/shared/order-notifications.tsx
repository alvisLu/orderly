"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const SOURCE_LABEL: Record<string, string> = {
  online: "線上訂單",
  qrcode: "QR Code 訂單",
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function OrderNotifications() {
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
        });

      cleanup = () => realtimeClient!.removeChannel(channel);
    });

    return () => cleanup();
  }, []);

  return null;
}
