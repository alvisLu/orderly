"use client";

import { useEffect, useState, useTransition } from "react";
import dayjs from "@/lib/dayjs";
import { toast } from "sonner";
import {
  apiDeleteMoneyCount,
  apiGetMoneyCounts,
} from "@/app/api/money-counts/api";
import type { MoneyCount } from "@/modules/money-counts/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { DateField, DateNavigator } from "@/components/shared/date-fields";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateMoneyCountDialog } from "./components/create-money-count-dialog";
import { MoneyCountCard } from "./components/money-count-card";

const DAILY_LIMIT = 3;

export default function MoneyCountsPage() {
  const [records, setRecords] = useState<MoneyCount[]>([]);
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [deleting, setDeleting] = useState<MoneyCount | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isLoading, startLoading] = useTransition();

  useEffect(() => {
    startLoading(async () => {
      const res = await apiGetMoneyCounts({
        page: 1,
        limit: DAILY_LIMIT,
        sort: "asc",
        from: dayjs.utc(date).toDate(),
        to: dayjs.utc(date).endOf("day").toDate(),
      });
      setRecords(res.data);
    });
  }, [date, refreshKey]);

  function applyDayOffset(offset: number) {
    setDate((d) => dayjs(d).add(offset, "day").format("YYYY-MM-DD"));
  }

  function goToToday() {
    setDate(dayjs().format("YYYY-MM-DD"));
  }

  async function handleConfirmDelete() {
    if (!deleting) return;
    try {
      await apiDeleteMoneyCount(deleting.id);
      setRefreshKey((k) => k + 1);
      toast.success("已刪除點錢紀錄");
    } catch {
      toast.error("刪除點錢紀錄失敗");
    } finally {
      setDeleting(null);
    }
  }

  const reachedLimit = records.length >= DAILY_LIMIT;

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">點錢紀錄</h1>
        <CreateMoneyCountDialog
          disabled={reachedLimit}
          onCreated={() => setRefreshKey((k) => k + 1)}
        />
      </div>

      <div className="flex flex-nowrap items-end gap-2 mb-4 overflow-x-auto">
        <DateField value={date} onChange={setDate} />

        <DateNavigator
          unit="day"
          jump={7}
          onOffset={applyDayOffset}
          onCurrent={goToToday}
        />
      </div>

      <div className="flex-1 min-h-0">
        {isLoading ? (
          <Card size="sm">
            <CardContent className="py-8 flex justify-center text-muted-foreground">
              <Spinner className="size-6" />
            </CardContent>
          </Card>
        ) : records.length === 0 ? (
          <Card size="sm">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              當日無點錢紀錄
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {records.map((record) => (
              <MoneyCountCard
                key={record.id}
                record={record}
                onDelete={setDeleting}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              此操作無法還原，確定要刪除此點錢紀錄嗎？
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
