"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import dayjs from "@/lib/dayjs";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { apiGetExpenses } from "@/app/api/expenses/api";
import type { Expenses } from "@/modules/expenses/types";
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
import { ExpenseDailyChart } from "../components/expense-daily-chart";
import { ExpenseDailyTable } from "../components/expense-daily-table";
import {
  ExpenseTypeStat,
  type ExpenseTypeTotal,
} from "../components/expense-type-stat";

export default function ExpenseReportPage() {
  const [startDate, setStartDate] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(
    dayjs().endOf("month").format("YYYY-MM-DD")
  );
  const [expenses, setExpenses] = useState<Expenses[] | null>(null);
  const [isLoading, startLoading] = useTransition();

  useEffect(() => {
    startLoading(async () => {
      const res = await apiGetExpenses({
        from: dayjs.utc(startDate).toDate(),
        to: dayjs.utc(endDate).endOf("day").toDate(),
        sort: "desc",
        page: 1,
        limit: 1000,
      });
      setExpenses(res.data);
    });
  }, [startDate, endDate]);

  const typeTotals = useMemo<ExpenseTypeTotal[]>(() => {
    if (!expenses) return [];
    const map = new Map<string, { total: number; count: number }>();
    for (const e of expenses) {
      const name = e.expendType ?? "未分類";
      const price = Number(e.price);
      const prev = map.get(name) ?? { total: 0, count: 0 };
      map.set(name, { total: prev.total + price, count: prev.count + 1 });
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, total: v.total, count: v.count }))
      .filter((t) => t.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const summary = useMemo(() => {
    if (!expenses) return null;
    const totalSpent = expenses.reduce((s, e) => s + Number(e.price), 0);
    return { totalSpent };
  }, [expenses]);

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

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">支出報表</h1>
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

      {isLoading ? (
        <Card size="sm">
          <CardContent className="py-8 flex justify-center text-muted-foreground">
            <Spinner className="size-6" />
          </CardContent>
        </Card>
      ) : typeTotals.length === 0 ? (
        <Card size="sm">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            區間內無支出紀錄
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {typeTotals.map((t) => (
              <ExpenseTypeStat key={t.name} amount={t} />
            ))}
          </div>
          {summary && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
              <Stat>
                <StatLabel>總支出</StatLabel>
                <StatValue className="text-lg text-destructive">
                  -{Math.round(summary.totalSpent).toLocaleString()}
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
              <ExpenseDailyChart expenses={expenses} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="table">
              <ExpenseDailyTable expenses={expenses} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
