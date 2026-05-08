"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { OrdersReport } from "@/modules/orders/types";

interface Props {
  stats: OrdersReport | null;
  isLoading?: boolean;
  showDeleted?: boolean;
}

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString();
}

function StatCell({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Badge variant="third" className="w-fit">
        {label}
      </Badge>
      <span className={cn("text-sm pl-1", valueClassName)}>{value}</span>
    </div>
  );
}

export function OrdersReportPanel({ stats, isLoading, showDeleted }: Props) {
  if (isLoading && !stats) {
    return (
      <div className="flex flex-col gap-2 mb-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex flex-col gap-3 mb-4">
      <Card size="sm">
        <CardContent className="flex flex-col gap-3">
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
            <Button variant="outline" className="shrink-0">
              {stats.count} 筆
            </Button>
            <Button variant="outline" className="shrink-0">
              總額: {formatNumber(stats.total)}
            </Button>
            <Button variant="secondary" className="shrink-0">
              已完成 {formatNumber(stats.doneTotal)}
            </Button>

            {showDeleted && (
              <Button variant="destructive" className="shrink-0">
                已取消 {formatNumber(stats.cancelledTotal)}
              </Button>
            )}
            <Button variant="default" className="shrink-0">
              未完成 {formatNumber(stats.unfinishedTotal)}
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto whitespace-nowrap [&>*]:shrink-0">
            <StatCell label="已收款" value={formatNumber(stats.paidTotal)} />
            <StatCell label="處理中" value={`${stats.processingCount} 筆`} />
            <StatCell label="折扣" value={formatNumber(stats.discount)} />
            <StatCell label="已退款" value={formatNumber(stats.refundTotal)} />
            <StatCell label="人次" value={formatNumber(stats.peopleCount)} />
            <StatCell label="均消" value={formatNumber(stats.avgPerOrder)} />
            <StatCell label="人均消" value={formatNumber(stats.avgPerPerson)} />
          </div>

          {stats.byGateway.length > 0 && (
            <div className="flex gap-x-6 gap-y-3 overflow-x-auto whitespace-nowrap [&>*]:shrink-0">
              {stats.byGateway.map((g) => (
                <StatCell
                  key={g.name}
                  label={g.name}
                  value={formatNumber(g.totalIn)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
