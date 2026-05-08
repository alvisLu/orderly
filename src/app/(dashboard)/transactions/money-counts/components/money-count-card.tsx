"use client";

import dayjs from "@/lib/dayjs";
import { Equal, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CURRENCY_DENOMINATIONS } from "@/modules/money-counts/dto";
import type {
  CurrencyDenomination,
  CurrencyEntry,
  MoneyCount,
} from "@/modules/money-counts/types";

function totalAmount(currencies: CurrencyEntry[]) {
  return currencies.reduce(
    (sum, entry) => sum + entry.denomination * entry.count,
    0
  );
}

function getCount(
  currencies: CurrencyEntry[],
  denomination: CurrencyDenomination
) {
  return currencies.find((c) => c.denomination === denomination)?.count ?? 0;
}

interface Props {
  record: MoneyCount;
  onDelete: (record: MoneyCount) => void;
}

export function MoneyCountCard({ record, onDelete }: Props) {
  const total = totalAmount(record.currencies);

  return (
    <Card size="sm" className="px-3 py-3">
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex flex-1 items-center justify-between gap-3 rounded-md px-2 py-1 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="font-medium">
                {dayjs(record.createdAt).format("YYYY-MM-DD HH:mm")}
              </span>
              <span className="text-xl font-semibold tabular-nums">
                ${total}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-96 p-4">
            <div className="space-y-3">
              {CURRENCY_DENOMINATIONS.map((d) => {
                const count = getCount(record.currencies, d);
                const subtotal = d * count;
                return (
                  <div key={d} className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-base font-medium">
                      {d} 元
                    </span>
                    <X className="h-4 w-4 text-muted-foreground" />
                    <span className="flex h-10 flex-1 items-center rounded-md bg-muted/40 px-3 tabular-nums">
                      {count}
                    </span>
                    <Equal className="h-4 w-4 text-muted-foreground" />
                    <span className="w-24 shrink-0 text-right font-medium tabular-nums">
                      ${subtotal}
                    </span>
                  </div>
                );
              })}

              <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">總金額</span>
                  <span className="text-lg font-semibold">${total}</span>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => onDelete(record)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}
