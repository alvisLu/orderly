"use client";

import { useEffect, useState } from "react";
import dayjs from "@/lib/dayjs";
import { RefreshCw } from "lucide-react";
import {
  apiGetDailyOrderReports,
  apiRegenerateOrderReports,
} from "@/app/api/orders/api";
import type { DailyOrdersReport } from "@/modules/orders/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  DateField,
  DateNavigator,
} from "@/components/shared/date-fields";
import { GatewayStat } from "../components/gateway-stat";
import { usePaymentOrder } from "../hooks/use-payment-order";

export default function DailyReportPage() {
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [stats, setStats] = useState<DailyOrdersReport | null>(null);
  const [phase, setPhase] = useState<"loading" | "recalculating" | "ready">(
    "loading"
  );
  const getPaymentRank = usePaymentOrder();

  async function recalculate() {
    setPhase("recalculating");
    const d = dayjs.utc(date).toDate();
    const [report] = await apiRegenerateOrderReports(d, d);
    setStats(report);
    setPhase("ready");
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPhase("loading");
      const d = dayjs.utc(date).toDate();
      const [report] = await apiGetDailyOrderReports(d, d);
      if (cancelled) return;
      setStats(report);
      setPhase("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [date]);

  function applyDayOffset(offset: number) {
    setDate((d) => dayjs(d).add(offset, "day").format("YYYY-MM-DD"));
  }

  function goToToday() {
    setDate(dayjs().format("YYYY-MM-DD"));
  }

  const rows =
    stats?.byGateway
      .filter((g) => g.totalIn > 0 || g.totalOut > 0)
      .sort((a, b) => getPaymentRank(a.name) - getPaymentRank(b.name)) ?? [];

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">日報表</h1>
      </div>

      <div className="flex flex-wrap items-end gap-2 mb-4">
        <DateField label="日期" value={date} onChange={setDate} />

        <DateNavigator
          unit="day"
          jump={7}
          onOffset={applyDayOffset}
          onCurrent={goToToday}
        />

        <div className="space-y-1">
          <Button
            size="lg"
            variant="secondary"
            onClick={recalculate}
            disabled={phase !== "ready"}
          >
            <RefreshCw
              className={cn(phase === "recalculating" && "animate-spin")}
            />
            重新計算
          </Button>
        </div>
      </div>

      {phase === "loading" || phase === "recalculating" ? (
        <Card size="sm">
          <CardContent className="py-8 flex justify-center text-muted-foreground">
            <Spinner className="size-6" />
          </CardContent>
        </Card>
      ) : rows.length === 0 ? (
        <Card size="sm">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            當日無交易紀錄
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {rows.map((g) => (
            <GatewayStat key={g.name} gateway={g} />
          ))}
        </div>
      )}
    </div>
  );
}
