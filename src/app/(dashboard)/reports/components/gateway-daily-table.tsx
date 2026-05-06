"use client";

import { useMemo } from "react";
import dayjs from "@/lib/dayjs";
import type { DailyOrdersReport } from "@/modules/orders/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DailyRow = {
  date: string;
  perGateway: Map<string, number>;
  totalIn: number;
  totalOut: number;
  net: number;
  count: number;
};

function formatAmount(value: number) {
  if (value === 0) return "—";
  return value.toLocaleString();
}

export function GatewayDailyTable({
  reports,
  isLoading,
  gatewayOrder,
}: {
  reports: DailyOrdersReport[] | null;
  isLoading: boolean;
  gatewayOrder?: (name: string) => number;
}) {
  const { gateways, rows, totals } = useMemo(() => {
    if (!reports) {
      return {
        gateways: [] as string[],
        rows: [] as DailyRow[],
        totals: null as DailyRow | null,
      };
    }

    const activeGateways = new Set<string>();
    for (const r of reports) {
      for (const g of r.byGateway) {
        if (g.totalIn > 0 || g.totalOut > 0) activeGateways.add(g.name);
      }
    }
    const gatewayList = Array.from(activeGateways).sort((a, b) =>
      gatewayOrder ? gatewayOrder(a) - gatewayOrder(b) : a.localeCompare(b)
    );

    const dailyRows: DailyRow[] = reports.map((r) => {
      const perGateway = new Map<string, number>();
      let totalIn = 0;
      let totalOut = 0;
      for (const g of r.byGateway) {
        perGateway.set(g.name, g.totalIn - g.totalOut);
        totalIn += g.totalIn;
        totalOut += g.totalOut;
      }
      return {
        date: r.date,
        perGateway,
        totalIn,
        totalOut,
        net: totalIn - totalOut,
        count: r.count,
      };
    });

    const totalRow: DailyRow = {
      date: "總計",
      perGateway: new Map(
        gatewayList.map((name) => [
          name,
          dailyRows.reduce(
            (sum, row) => sum + (row.perGateway.get(name) ?? 0),
            0
          ),
        ])
      ),
      totalIn: dailyRows.reduce((sum, r) => sum + r.totalIn, 0),
      totalOut: dailyRows.reduce((sum, r) => sum + r.totalOut, 0),
      net: dailyRows.reduce((sum, r) => sum + r.net, 0),
      count: dailyRows.reduce((sum, r) => sum + r.count, 0),
    };

    return { gateways: gatewayList, rows: dailyRows, totals: totalRow };
  }, [reports, gatewayOrder]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>每日明細</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && !reports ? (
          <Skeleton className="h-64 w-full" />
        ) : !reports || rows.length === 0 || gateways.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            區間內無交易紀錄
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background">
                    日期
                  </TableHead>
                  {gateways.map((name) => (
                    <TableHead key={name} className="text-right">
                      {name}
                    </TableHead>
                  ))}
                  <TableHead className="text-right">總進帳</TableHead>
                  <TableHead className="text-right">總出帳</TableHead>
                  <TableHead className="text-right">總淨額</TableHead>
                  <TableHead className="text-right">筆數</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell className="sticky left-0 bg-background font-medium">
                      {dayjs(row.date).format("MM/DD (dd)")}
                    </TableCell>
                    {gateways.map((name) => (
                      <TableCell key={name} className="text-right tabular-nums">
                        {formatAmount(row.perGateway.get(name) ?? 0)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right tabular-nums">
                      {formatAmount(row.totalIn)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-destructive">
                      {row.totalOut > 0
                        ? `-${row.totalOut.toLocaleString()}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatAmount(row.net)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.count}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {totals && (
                <TableFooter>
                  <TableRow>
                    <TableCell className="sticky left-0 bg-muted/50">
                      {totals.date}
                    </TableCell>
                    {gateways.map((name) => (
                      <TableCell key={name} className="text-right tabular-nums">
                        {formatAmount(totals.perGateway.get(name) ?? 0)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right tabular-nums">
                      {formatAmount(totals.totalIn)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-destructive">
                      {totals.totalOut > 0
                        ? `-${totals.totalOut.toLocaleString()}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatAmount(totals.net)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {totals.count}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
