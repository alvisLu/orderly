"use client";

import { useState } from "react";
import { toast } from "sonner";
import dayjs from "@/lib/dayjs";
import { apiCreateMoneyCount } from "@/app/api/money-counts/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { MoneyCount } from "@/modules/money-counts/types";
import { MoneyCountForm } from "./money-count-form";

interface Props {
  onCreated: (record: MoneyCount) => void;
  disabled?: boolean;
  date?: string;
}

function buildCreatedAt(date?: string): Date | undefined {
  if (!date) return undefined;
  const now = dayjs.utc();
  return dayjs
    .utc(date)
    .hour(now.hour())
    .minute(now.minute())
    .second(now.second())
    .millisecond(now.millisecond())
    .toDate();
}

export function CreateMoneyCountDialog({ onCreated, disabled, date }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" disabled={disabled}>
          新增點錢紀錄
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            新增點錢紀錄
            {date && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {date}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        {open && (
          <MoneyCountForm
            submittingLabel="新增中..."
            defaultLabel="新增"
            onCancel={() => setOpen(false)}
            onSubmit={async (currencies) => {
              try {
                const record = await apiCreateMoneyCount({
                  currencies,
                  createdAt: buildCreatedAt(date),
                });
                setOpen(false);
                onCreated(record);
                toast.success("已新增點錢紀錄");
              } catch {
                toast.error("新增點錢紀錄失敗");
              }
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
