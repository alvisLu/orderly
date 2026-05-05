"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import dayjs from "@/lib/dayjs";
import type { DailyOrdersReport } from "@/modules/orders/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  reports,
  isLoading,
  gatewayOrder,
}: {
  reports: DailyOrdersReport[] | null;
  isLoading: boolean;
  gatewayOrder?: (name: string) => number;
}) {
  const { chartConfig, chartData, series, dailyAverage } = useMemo(() => {
    if (!reports) {
      return {
        chartConfig: {} as ChartConfig,
        chartData: [] as Array<Record<string, number | string>>,
        series: [] as Array<{ key: string; label: string }>,
        dailyAverage: 0,
      };
    }
    const gateways = Array.from(
      new Set(reports.flatMap((r) => r.byGateway.map((g) => g.name)))
    ).sort((a, b) =>
      gatewayOrder ? gatewayOrder(a) - gatewayOrder(b) : a.localeCompare(b)
    );
    const config: ChartConfig = {};
    const seriesList = gateways.map((name, index) => ({
      key: `g${index}`,
      label: name,
    }));
    seriesList.forEach((s, index) => {
      config[s.key] = {
        label: s.label,
        color: PALETTE[index % PALETTE.length],
      };
    });
    const data = reports.map((row) => {
      const entry: Record<string, number | string> = { date: row.date };
      for (const s of seriesList) {
        const g = row.byGateway.find((b) => b.name === s.label);
        entry[s.key] = g ? g.totalIn - g.totalOut : 0;
      }
      return entry;
    });
    const totalNet = reports.reduce(
      (sum, row) =>
        sum +
        row.byGateway.reduce((s, g) => s + (g.totalIn - g.totalOut), 0),
      0
    );
    const workingDays = reports.filter((row) =>
      row.byGateway.some((g) => g.totalIn > 0)
    ).length;
    const average = workingDays > 0 ? totalNet / workingDays : 0;
    return {
      chartConfig: config,
      chartData: data,
      series: seriesList,
      dailyAverage: average,
    };
  }, [reports, gatewayOrder]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>各通路每日收入</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && !reports ? (
          <Skeleton className="h-64 w-full" />
        ) : !reports || series.length === 0 ? (
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
              <ReferenceLine
                y={dailyAverage}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                strokeOpacity={0.8}
                ifOverflow="extendDomain"
                label={{
                  value: `日均 ${Math.round(dailyAverage).toLocaleString()}`,
                  position: "insideTopRight",
                  fill: "var(--muted-foreground)",
                  fontSize: 11,
                }}
              />
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
