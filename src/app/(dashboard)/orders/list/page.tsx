"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import dayjs from "@/lib/dayjs";
import { apiGetOrders, apiGetOrdersReport } from "@/app/api/orders/api";
import type { Order, OrdersReport } from "@/modules/orders/types";
import { useNewOrdersStore } from "@/store/new-orders";
import { OrdersTable } from "../components/orders-table";
import { OrdersReportPanel } from "../components/orders-report";
import { CreateOrderDialog } from "../components/create-order-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DateNavigator, DateRangeField } from "@/components/shared/date-fields";

function dayRange(date: string) {
  return { from: date, to: date };
}

const initialRange = dayRange(dayjs().format("YYYY-MM-DD"));

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, startLoading] = useTransition();
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showDeleted, setShowDeleted] = useState(false);
  const [range, setRange] = useState(initialRange);
  const [stats, setStats] = useState<OrdersReport | null>(null);
  const [isStatsLoading, startStatsLoading] = useTransition();

  useEffect(() => {
    startLoading(async () => {
      const res = await apiGetOrders({
        page: pageIndex + 1,
        limit: pageSize,
        showDeleted,
        from: dayjs.utc(range.from).toDate(),
        to: dayjs.utc(range.to).endOf("day").toDate(),
      });
      setOrders(res.data);
      setTotal(res.total);
    });
  }, [pageIndex, pageSize, showDeleted, range]);

  const reloadStats = useCallback(() => {
    startStatsLoading(async () => {
      const s = await apiGetOrdersReport({
        showDeleted,
        from: dayjs.utc(range.from).toDate(),
        to: dayjs.utc(range.to).endOf("day").toDate(),
      });
      setStats(s);
    });
  }, [showDeleted, range]);

  useEffect(() => {
    reloadStats();
  }, [reloadStats]);

  const newOrdersBatch = useNewOrdersStore((s) => s.batch);
  const newOrdersVersion = useNewOrdersStore((s) => s.version);

  useEffect(() => {
    if (newOrdersBatch.length === 0) return;
    const fromMs = dayjs.utc(range.from).valueOf();
    const toMs = dayjs.utc(range.to).endOf("day").valueOf();
    setOrders((prev) => {
      const seen = new Set(prev.map((o) => o.id));
      const additions = newOrdersBatch.filter((o) => {
        if (seen.has(o.id)) return false;
        const ts = new Date(o.createdAt).getTime();
        return ts >= fromMs && ts <= toMs;
      });
      return additions.length > 0 ? [...additions, ...prev] : prev;
    });
    reloadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newOrdersVersion]);

  function applyDayOffset(offset: number) {
    const base = range.from ? dayjs(range.from) : dayjs();
    const target = base.add(offset, "day").format("YYYY-MM-DD");
    setPageIndex(0);
    setRange(dayRange(target));
  }

  function goToToday() {
    setPageIndex(0);
    setRange(dayRange(dayjs().format("YYYY-MM-DD")));
  }

  function handleUpdated(updated: Order) {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    reloadStats();
  }

  function handleDeleted(id: string) {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    reloadStats();
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold mb-2">訂單列表</h1>
        <CreateOrderDialog
          onCreated={(o) => useNewOrdersStore.getState().publish([o])}
        />
      </div>

      <div className="flex items-end gap-2 mb-4 overflow-x-auto whitespace-nowrap">
        <DateRangeField
          value={range}
          onChange={(next) => {
            setPageIndex(0);
            setRange(next);
          }}
        />

        <DateNavigator
          unit="day"
          onOffset={applyDayOffset}
          onCurrent={goToToday}
        />

        <div className="flex items-center gap-2 h-9 shrink-0">
          <Checkbox
            id="showDeleted"
            checked={showDeleted}
            onCheckedChange={(checked) => {
              setShowDeleted(!!checked);
              setPageIndex(0);
              setOrders([]);
            }}
          />
          <Label htmlFor="showDeleted" className="text-sm cursor-pointer">
            顯示已刪除
          </Label>
        </div>
      </div>

      <OrdersReportPanel
        stats={stats}
        isLoading={isStatsLoading}
        showDeleted={showDeleted}
      />

      <div className="flex-1 min-h-0">
        <OrdersTable
          data={orders}
          isLoading={isLoading}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
          showDeleted={showDeleted}
          serverPagination={{
            total,
            pageIndex,
            pageSize,
            onPageChange: setPageIndex,
            onPageSizeChange: (size: number) => {
              setPageSize(size);
              setPageIndex(0);
            },
          }}
        />
      </div>
    </div>
  );
}
