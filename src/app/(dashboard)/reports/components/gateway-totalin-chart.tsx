"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import dayjs from "@/lib/dayjs";
import { apiGetDailyGatewayStats } from "@/app/api/orders/api";
import type { DailyGatewayStats } from "@/modules/orders/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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

export function GatewayTotalInChart({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const [stats, setStats] = useState<DailyGatewayStats | null>(null);
  const [isLoading, startLoading] = useTransition();

  useEffect(() => {
    startLoading(async () => {
      const s = await apiGetDailyGatewayStats({
        from: dayjs.utc(startDate).toDate(),
        to: dayjs.utc(endDate).endOf("day").toDate(),
      });
      setStats(s);
    });
  }, [startDate, endDate]);

  const { chartConfig, chartData, series } = useMemo(() => {
    if (!stats) {
      return {
        chartConfig: {} as ChartConfig,
        chartData: [] as Array<Record<string, number | string>>,
        series: [] as Array<{ key: string; label: string }>,
      };
    }
    const config: ChartConfig = {};
    const seriesList = stats.gateways.map((name, index) => ({
      key: `g${index}`,
      label: name,
    }));
    seriesList.forEach((s, index) => {
      config[s.key] = {
        label: s.label,
        color: PALETTE[index % PALETTE.length],
      };
    });
    const data = stats.rows.map((row) => {
      const entry: Record<string, number | string> = { date: row.date };
      for (const s of seriesList) {
        entry[s.key] = row.totals[s.label] ?? 0;
      }
      return entry;
    });
    return { chartConfig: config, chartData: data, series: seriesList };
  }, [stats]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>各通路每日收入</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && !stats ? (
          <Skeleton className="h-64 w-full" />
        ) : !stats || series.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            區間內無交易紀錄
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                tickFormatter={(v: string) => dayjs(v).format("MM/DD")}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => v.toLocaleString()}
                width={64}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(value) =>
                      dayjs(value as string).format("YYYY-MM-DD")
                    }
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              {series.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={`var(--color-${s.key})`}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
