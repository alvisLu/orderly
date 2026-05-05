"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import dayjs from "@/lib/dayjs";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
} from "lucide-react";
import {
  apiGetDailyOrderReports,
  apiRegenerateOrderReports,
} from "@/app/api/orders/api";
import { aggregateDailyReports } from "@/modules/orders/aggregate";
import type { DailyOrdersReport } from "@/modules/orders/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Stat, StatLabel, StatValue } from "@/components/ui/stat";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { GatewayDailyTable } from "../components/gateway-daily-table";
import { GatewayStat } from "../components/gateway-stat";
import { GatewayTotalInChart } from "../components/gateway-totalin-chart";
import { usePaymentOrder } from "../hooks/use-payment-order";

export default function MonthlyReportPage() {
  const [startDate, setStartDate] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(
    dayjs().endOf("month").format("YYYY-MM-DD")
  );
  const [reports, setReports] = useState<DailyOrdersReport[] | null>(null);
  const [isLoading, startLoading] = useTransition();
  const [isRecalculating, startRecalculating] = useTransition();
  const getPaymentRank = usePaymentOrder();

  function recalculate() {
    startRecalculating(async () => {
      const r = await apiRegenerateOrderReports(
        dayjs.utc(startDate).toDate(),
        dayjs.utc(endDate).toDate()
      );
      setReports(r);
    });
  }

  useEffect(() => {
    startLoading(async () => {
      const r = await apiGetDailyOrderReports(
        dayjs.utc(startDate).toDate(),
        dayjs.utc(endDate).toDate()
      );
      setReports(r);
    });
  }, [startDate, endDate]);

  const stats = useMemo(
    () => (reports ? aggregateDailyReports(reports) : null),
    [reports]
  );

  const summary = useMemo(() => {
    if (!reports) return null;
    const days = reports.map((r) => ({
      net: r.byGateway.reduce((s, g) => s + (g.totalIn - g.totalOut), 0),
      hasIncome: r.byGateway.some((g) => g.totalIn > 0),
    }));
    const working = days.filter((d) => d.hasIncome);
    const totalNet = working.reduce((s, d) => s + d.net, 0);
    const dailyAverage = working.length > 0 ? totalNet / working.length : 0;
    const aboveAverageDays = working.filter((d) => d.net > dailyAverage).length;
    return {
      workingDays: working.length,
      dailyAverage,
      aboveAverageDays,
    };
  }, [reports]);

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
    stats?.byGateway
      .filter((g) => g.totalIn > 0 || g.totalOut > 0)
      .sort((a, b) => getPaymentRank(a.name) - getPaymentRank(b.name)) ?? [];

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

        <div className="space-y-1">
          <Button
            size="lg"
            variant="secondary"
            onClick={recalculate}
            disabled={isLoading || isRecalculating}
          >
            <RefreshCw className={cn(isRecalculating && "animate-spin")} />
            重新計算
          </Button>
        </div>
      </div>

      {isLoading || isRecalculating ? (
        <Card size="sm">
          <CardContent className="py-8 flex justify-center text-muted-foreground">
            <Spinner className="size-6" />
          </CardContent>
        </Card>
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
          {summary && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
              <Stat>
                <StatLabel>工作日</StatLabel>
                <StatValue className="text-lg">
                  {summary.workingDays} 天
                </StatValue>
              </Stat>
              <Stat>
                <StatLabel>日均收入</StatLabel>
                <StatValue className="text-lg">
                  {Math.round(summary.dailyAverage).toLocaleString()}
                </StatValue>
              </Stat>
              <Stat>
                <StatLabel>大於日均天數</StatLabel>
                <StatValue className="text-lg">
                  {summary.aboveAverageDays} 天
                </StatValue>
              </Stat>
            </div>
          )}
          <Tabs defaultValue="chart">
            <TabsList>
              <TabsTrigger value="chart">圖表</TabsTrigger>
              <TabsTrigger value="table">表格</TabsTrigger>
            </TabsList>
            <TabsContent value="chart">
              <GatewayTotalInChart
                reports={reports}
                isLoading={isLoading}
                gatewayOrder={getPaymentRank}
              />
            </TabsContent>
            <TabsContent value="table">
              <GatewayDailyTable
                reports={reports}
                isLoading={isLoading}
                gatewayOrder={getPaymentRank}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
