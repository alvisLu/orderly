"use client";

import { useMemo } from "react";
import { Pie, PieChart } from "recharts";
import type { Expenses } from "@/modules/expenses/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const UNCATEGORIZED = "未分類";

function LegendWithAmount({
  payload,
}: {
  payload?: ReadonlyArray<{
    color?: string;
    payload?: { name?: string; value?: number };
  }>;
}) {
  if (!payload?.length) return null;
  return (
    <div className="flex flex-col gap-1 pt-3 text-xs">
      {payload.map((item, i) => {
        const name = item.payload?.name ?? "";
        const value = item.payload?.value ?? 0;
        return (
          <div key={i} className="flex items-center gap-2">
            <div
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: item.color }}
            />
            <span className="flex-1 truncate">{name}</span>
            <span className="font-mono tabular-nums text-destructive">
              -{Math.round(value).toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ExpenseDailyChart({
  expenses,
  isLoading,
}: {
  expenses: Expenses[] | null;
  isLoading: boolean;
}) {
  const { chartConfig, chartData } = useMemo(() => {
    if (!expenses) {
      return {
        chartConfig: {} as ChartConfig,
        chartData: [] as Array<{ name: string; value: number; fill: string }>,
      };
    }
    const totals = new Map<string, number>();
    for (const e of expenses) {
      const name = e.expendType ?? UNCATEGORIZED;
      totals.set(name, (totals.get(name) ?? 0) + Number(e.price));
    }
    const entries = Array.from(totals.entries())
      .filter(([, total]) => total > 0)
      .sort((a, b) => b[1] - a[1]);
    const config: ChartConfig = {};
    const data = entries.map(([name, value], index) => {
      const color = PALETTE[index % PALETTE.length];
      config[name] = { label: name, color };
      return { name, value, fill: color };
    });
    return { chartConfig: config, chartData: data };
  }, [expenses]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>各類型支出佔比</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && !expenses ? (
          <Skeleton className="h-64 w-full" />
        ) : !expenses || chartData.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            區間內無支出紀錄
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto h-64 aspect-square"
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="name" hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={2}
              />
              <ChartLegend content={<LegendWithAmount />} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
