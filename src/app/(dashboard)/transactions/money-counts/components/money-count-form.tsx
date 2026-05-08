"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Equal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calculator } from "@/components/shared/calculator";
import { CURRENCY_DENOMINATIONS } from "@/modules/money-counts/dto";
import type {
  CurrencyDenomination,
  CurrencyEntry,
} from "@/modules/money-counts/types";

const schema = z.object(
  Object.fromEntries(
    CURRENCY_DENOMINATIONS.map((d) => [
      String(d),
      z.coerce.number().int().nonnegative("不可為負"),
    ])
  ) as Record<string, z.ZodNumber>
);

type FormInput = z.input<typeof schema>;
type FormValues = z.infer<typeof schema>;

interface Props {
  initialCurrencies?: CurrencyEntry[];
  submittingLabel: string;
  defaultLabel: string;
  onCancel: () => void;
  onSubmit: (currencies: CurrencyEntry[]) => Promise<void>;
}

export function MoneyCountForm({
  initialCurrencies,
  submittingLabel,
  defaultLabel,
  onCancel,
  onSubmit,
}: Props) {
  const initialValues = useMemo(() => {
    const map = new Map<CurrencyDenomination, number>();
    initialCurrencies?.forEach((entry) =>
      map.set(entry.denomination, entry.count)
    );
    return Object.fromEntries(
      CURRENCY_DENOMINATIONS.map((d) => [String(d), map.get(d) ?? 0])
    ) as FormValues;
  }, [initialCurrencies]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });
  const [openDenom, setOpenDenom] = useState<CurrencyDenomination | null>(null);

  function updateCount(d: CurrencyDenomination, next: number) {
    const safe = Math.max(0, Math.floor(Number.isFinite(next) ? next : 0));
    setValue(String(d), safe, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  const values = watch();
  const totalAmount = CURRENCY_DENOMINATIONS.reduce((sum, d) => {
    const count = Number(values[String(d)]) || 0;
    return sum + d * count;
  }, 0);
  const totalCount = CURRENCY_DENOMINATIONS.reduce(
    (sum, d) => sum + (Number(values[String(d)]) || 0),
    0
  );

  async function submit(formValues: FormValues) {
    const currencies: CurrencyEntry[] = CURRENCY_DENOMINATIONS.map((d) => ({
      denomination: d,
      count: formValues[String(d)] ?? 0,
    })).filter((entry) => entry.count > 0);
    await onSubmit(currencies);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {CURRENCY_DENOMINATIONS.map((d) => {
          const count = Number(values[String(d)]) || 0;
          const subtotal = d * count;
          const isOpen = openDenom === d;
          return (
            <div key={d} className="space-y-1">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor={`denom-${d}`}
                  className="w-20 shrink-0 text-base"
                >
                  {d} 元
                </Label>
                <X className="h-4 w-4 text-muted-foreground" />
                <Popover
                  open={isOpen}
                  onOpenChange={(open) => setOpenDenom(open ? d : null)}
                >
                  <PopoverTrigger asChild>
                    <Input
                      id={`denom-${d}`}
                      type="text"
                      inputMode="none"
                      readOnly
                      tabIndex={-1}
                      value={String(count)}
                      onFocus={(e) => e.currentTarget.blur()}
                      className="h-10 flex-1 cursor-pointer focus-visible:border-input focus-visible:ring-0"
                      {...register(String(d))}
                    />
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="w-72 p-3"
                    onOpenAutoFocus={(event) => event.preventDefault()}
                  >
                    <Calculator
                      value={String(count)}
                      onChange={(v) => updateCount(d, Number(v))}
                      onConfirm={() => setOpenDenom(null)}
                      disableDot
                    />
                  </PopoverContent>
                </Popover>
                <Equal className="h-4 w-4 text-muted-foreground" />
                <span className="w-24 shrink-0 text-right font-medium tabular-nums">
                  ${subtotal}
                </span>
              </div>
              {errors[String(d)] && (
                <p className="text-sm text-destructive">
                  {errors[String(d)]?.message as string}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">總金額</span>
          <span className="text-lg font-semibold">${totalAmount}</span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" disabled={isSubmitting || totalAmount === 0}>
          {isSubmitting ? submittingLabel : defaultLabel}
        </Button>
      </div>
    </form>
  );
}
