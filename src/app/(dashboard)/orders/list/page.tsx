"use client";

import { useEffect, useState, useTransition } from "react";
import dayjs from "@/lib/dayjs";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { apiGetOrders } from "@/app/api/orders/api";
import type { Order } from "@/modules/orders/types";
import { OrdersTable } from "../components/orders-table";
import { CreateOrderDialog } from "../components/create-order-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  }

  function handleDeleted(id: string) {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">訂單列表</h1>
        <CreateOrderDialog
          onCreated={(o) => setOrders((prev) => [o, ...prev])}
        />
      </div>

      <div className="flex flex-wrap items-end gap-2 mb-4">
        <div className="space-y-1">
          <Label className="text-xs">起始日期</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-9 w-40 justify-start font-normal",
                  !range.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {range.from ? range.from : "選擇日期"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={range.from ? dayjs(range.from).toDate() : undefined}
                defaultMonth={
                  range.from ? dayjs(range.from).toDate() : undefined
                }
                onSelect={(d) => {
                  if (!d) return;
                  const next = dayjs(d).format("YYYY-MM-DD");
                  setPageIndex(0);
                  setRange((prev) => ({
                    from: next,
                    to: prev.to && prev.to < next ? next : prev.to,
                  }));
                }}
                disabled={(d) =>
                  !!range.to && dayjs(d).isAfter(dayjs(range.to), "day")
                }
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
                  !range.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {range.to ? range.to : "選擇日期"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={range.to ? dayjs(range.to).toDate() : undefined}
                defaultMonth={
                  range.to ? dayjs(range.to).toDate() : undefined
                }
                onSelect={(d) => {
                  if (!d) return;
                  const next = dayjs(d).format("YYYY-MM-DD");
                  setPageIndex(0);
                  setRange((prev) => ({
                    from: prev.from && prev.from > next ? next : prev.from,
                    to: next,
                  }));
                }}
                disabled={(d) =>
                  !!range.from && dayjs(d).isBefore(dayjs(range.from), "day")
                }
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
          </div>
        </div>

        <div className="flex items-center gap-2 h-9">
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

      <div className="flex-1 min-h-0">
        <OrdersTable
          data={orders}
          isLoading={isLoading}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
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
