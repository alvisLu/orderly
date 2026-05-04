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
import { apiGetOrderStats } from "@/app/api/orders/api";
import type { OrderStats } from "@/modules/orders/types";
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
import { Stat, StatLabel, StatValue } from "@/components/ui/stat";
import { cn } from "@/lib/utils";

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString();
}

export default function DailyReportPage() {
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, startLoading] = useTransition();

  useEffect(() => {
    startLoading(async () => {
      const s = await apiGetOrderStats({
        from: dayjs.utc(date).toDate(),
        to: dayjs.utc(date).endOf("day").toDate(),
      });
      setStats(s);
    });
  }, [date]);

  function applyDayOffset(offset: number) {
    setDate((d) => dayjs(d).add(offset, "day").format("YYYY-MM-DD"));
  }

  function goToToday() {
    setDate(dayjs().format("YYYY-MM-DD"));
  }

  const rows =
    stats?.byGateway.filter((g) => g.totalIn > 0 || g.totalOut > 0) ?? [];

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">日報表</h1>
      </div>

      <div className="flex flex-wrap items-end gap-2 mb-4">
        <div className="space-y-1">
          <Label className="text-xs">日期</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-9 w-40 justify-start font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date || "選擇日期"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dayjs(date).toDate()}
                defaultMonth={dayjs(date).toDate()}
                onSelect={(d) => {
                  if (!d) return;
                  setDate(dayjs(d).format("YYYY-MM-DD"));
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
              onClick={() => applyDayOffset(-7)}
            >
              <ChevronsLeft />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => applyDayOffset(-1)}
            >
              <ChevronLeft />
            </Button>
            <Button size="lg" variant="outline" onClick={goToToday}>
              今天
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => applyDayOffset(1)}
            >
              <ChevronRight />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => applyDayOffset(7)}
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
            當日無交易紀錄
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {rows.map((g) => (
            <Stat key={g.name} className="items-center">
              <div className="col-span-2 font-semibold text-base">{g.name}</div>
              <StatLabel>收入</StatLabel>
              <StatValue className="text-lg text-green-600 dark:text-green-400">
                +{formatNumber(g.totalIn)}
              </StatValue>
              <StatLabel>退款</StatLabel>
              <StatValue className="text-lg text-destructive">
                -{formatNumber(g.totalOut)}
              </StatValue>
            </Stat>
          ))}
        </div>
      )}
    </div>
  );
}
