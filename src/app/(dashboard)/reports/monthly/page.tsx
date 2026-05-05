"use client";

import { useEffect, useState, useTransition } from "react";
import dayjs from "@/lib/dayjs";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { apiGetOrdersReport } from "@/app/api/orders/api";
import type { OrdersReport } from "@/modules/orders/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { GatewayStat } from "../components/gateway-stat";
import { GatewayTotalInChart } from "../components/gateway-totalin-chart";

export default function MonthlyReportPage() {
  const [startDate, setStartDate] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(
    dayjs().endOf("month").format("YYYY-MM-DD")
  );
  const [stats, setStats] = useState<OrdersReport | null>(null);
  const [isLoading, startLoading] = useTransition();

  useEffect(() => {
    startLoading(async () => {
      const s = await apiGetOrdersReport({
        from: dayjs.utc(startDate).toDate(),
        to: dayjs.utc(endDate).endOf("day").toDate(),
      });
      setStats(s);
    });
  }, [startDate, endDate]);

  function setMonth(target: dayjs.Dayjs) {
    setStartDate(target.startOf("month").format("YYYY-MM-DD"));
    setEndDate(target.endOf("month").format("YYYY-MM-DD"));
  }

  function applyMonthOffset(offset: number) {
    setMonth(dayjs(startDate).add(offset, "month"));
  }

  function goToThisMonth() {
    setMonth(dayjs());
  }

  const rows =
    stats?.byGateway.filter((g) => g.totalIn > 0 || g.totalOut > 0) ?? [];

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">月報表</h1>
      </div>

      <div className="flex flex-wrap items-end gap-2 mb-4">
        <div className="space-y-1">
          <Label className="text-xs">開始日期</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-9 w-40 justify-start font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate || "選擇日期"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dayjs(startDate).toDate()}
                defaultMonth={dayjs(startDate).toDate()}
                onSelect={(d) => {
                  if (!d) return;
                  setStartDate(dayjs(d).format("YYYY-MM-DD"));
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">結束日期</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-9 w-40 justify-start font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate || "選擇日期"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dayjs(endDate).toDate()}
                defaultMonth={dayjs(endDate).toDate()}
                onSelect={(d) => {
                  if (!d) return;
                  setEndDate(dayjs(d).format("YYYY-MM-DD"));
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">快速選擇</Label>
          <div className="flex gap-1">
            <Button
              size="lg"
              variant="outline"
              onClick={() => applyMonthOffset(-12)}
            >
              <ChevronsLeft />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => applyMonthOffset(-1)}
            >
              <ChevronLeft />
            </Button>
            <Button size="lg" variant="outline" onClick={goToThisMonth}>
              本月
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => applyMonthOffset(1)}
            >
              <ChevronRight />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => applyMonthOffset(12)}
            >
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>

      {isLoading && !stats ? (
        <Skeleton className="h-32 w-full" />
      ) : rows.length === 0 ? (
        <Card size="sm">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            區間內無交易紀錄
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {rows.map((g) => (
              <GatewayStat key={g.name} gateway={g} />
            ))}
          </div>
          <GatewayTotalInChart startDate={startDate} endDate={endDate} />
        </div>
      )}
    </div>
  );
}
