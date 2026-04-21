"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import dayjs from "@/lib/dayjs";
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { apiDeleteExpense, apiGetExpenses } from "@/app/api/expenses/api";
import type { Expenses } from "@/modules/expenses/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateExpenseDialog } from "./components/create-expense-dialog";
import { EditExpenseDialog } from "./components/edit-expense-dialog";
import { ExpensesTable } from "./components/expenses-table";

function monthRange(year: number, month: number /* 1-12 */) {
  const start = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
  return {
    from: start.format("YYYY-MM-DD"),
    to: start.endOf("month").format("YYYY-MM-DD"),
  };
}

const initialRange = monthRange(dayjs().year(), dayjs().month() + 1);

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expenses[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [range, setRange] = useState(initialRange);

  const [editing, setEditing] = useState<Expenses | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState<Expenses | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isLoading, startLoading] = useTransition();

  useEffect(() => {
    startLoading(async () => {
      const res = await apiGetExpenses({
        page: pageIndex + 1,
        limit: pageSize,
        from: dayjs.utc(range.from).toDate(),
        to: dayjs.utc(range.to).endOf("day").toDate(),
      });
      setExpenses(res.data);
      setTotal(res.total);
    });
  }, [pageIndex, pageSize, range, refreshKey]);

  const selectedYear = useMemo(() => dayjs(range.from).year(), [range.from]);
  const selectedMonth = useMemo(
    () => dayjs(range.from).month() + 1,
    [range.from]
  );

  function applyMonthOffset(offset: number) {
    const base = range.from ? dayjs(range.from) : dayjs();
    const target = base.add(offset, "month");
    setPageIndex(0);
    setRange(monthRange(target.year(), target.month() + 1));
  }

  function goToCurrentMonth() {
    const now = dayjs();
    setPageIndex(0);
    setRange(monthRange(now.year(), now.month() + 1));
  }

  function handleMonthChange(month: number) {
    setPageIndex(0);
    setRange(monthRange(selectedYear, month));
  }

  function handleEdit(expense: Expenses) {
    setEditing(expense);
    setEditOpen(true);
  }

  function handleUpdated(updated: Expenses) {
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }

  async function handleConfirmDelete() {
    if (!deleting) return;
    try {
      await apiDeleteExpense(deleting.id);
      setRefreshKey((k) => k + 1);
      toast.success("已刪除支出");
    } catch {
      toast.error("刪除支出失敗");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">支出列表</h1>
        <CreateExpenseDialog
          onCreated={() => setRefreshKey((k) => k + 1)}
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
              onClick={() => applyMonthOffset(-1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={goToCurrentMonth}
            >
              本月
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => applyMonthOffset(1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">月份</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 w-20 justify-between">
                {selectedMonth}月
                <ChevronDownIcon className="ml-1 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="min-w-20 w-20"
            >
              <DropdownMenuRadioGroup
                value={String(selectedMonth)}
                onValueChange={(val) => handleMonthChange(Number(val))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <DropdownMenuRadioItem
                    key={m}
                    value={String(m)}
                    className="py-1 text-sm"
                  >
                    {m}月
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ExpensesTable
          data={expenses}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={setDeleting}
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

      <EditExpenseDialog
        expense={editing}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditing(null);
        }}
        onUpdated={handleUpdated}
      />

      <Dialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              此操作無法還原，確定要刪除此支出紀錄嗎？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
