"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "@/lib/dayjs";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { apiCreateExpense } from "@/app/api/expenses/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Expenses } from "@/modules/expenses/types";

const EXPEND_TYPE_OPTIONS = ["店面固定支出", "採購"] as const;
const PAY_METHOD_OPTIONS = ["現金", "轉帳", "信用卡"] as const;

const schema = z.object({
  expendAt: z.string().min(1, "請選擇日期"),
  expendType: z.enum(EXPEND_TYPE_OPTIONS, { message: "請選擇支出類型" }),
  payMethod: z.enum(PAY_METHOD_OPTIONS, { message: "請選擇付款方式" }),
  price: z.coerce.number().nonnegative("金額不可為負"),
  reimburse: z.string().max(255).optional(),
  description: z.string().optional(),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.infer<typeof schema>;

interface Props {
  onCreated: (expense: Expenses) => void;
}

export function CreateExpenseDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false);

  const defaultValues: Partial<FormInput> = {
    expendAt: dayjs().format("YYYY-MM-DD"),
    expendType: undefined,
    payMethod: undefined,
    price: 0,
    reimburse: "",
    description: "",
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  async function onSubmit(values: FormValues) {
    try {
      const expense = await apiCreateExpense({
        expendAt: dayjs.utc(values.expendAt).toDate(),
        expendType: values.expendType,
        payMethod: values.payMethod,
        price: values.price,
        reimburse: values.reimburse || null,
        description: values.description || null,
      });
      reset(defaultValues);
      setOpen(false);
      onCreated(expense);
      toast.success("已新增支出");
    } catch {
      toast.error("新增支出失敗");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">新增支出</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">新增支出</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label className="text-base">日期 *</Label>
            <Controller
              control={control}
              name="expendAt"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "h-10 w-full justify-start font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value || "選擇日期"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        field.value ? dayjs(field.value).toDate() : undefined
                      }
                      defaultMonth={
                        field.value ? dayjs(field.value).toDate() : undefined
                      }
                      onSelect={(d) => {
                        if (!d) return;
                        field.onChange(dayjs(d).format("YYYY-MM-DD"));
                      }}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.expendAt && (
              <p className="text-sm text-destructive">
                {errors.expendAt.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-base">類型 *</Label>
            <Controller
              control={control}
              name="expendType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="請選擇支出類型" />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" sideOffset={4}>
                    {EXPEND_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.expendType && (
              <p className="text-sm text-destructive">
                {errors.expendType.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-base">付款方式 *</Label>
            <Controller
              control={control}
              name="payMethod"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="請選擇付款方式" />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" sideOffset={4}>
                    {PAY_METHOD_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.payMethod && (
              <p className="text-sm text-destructive">
                {errors.payMethod.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="price" className="text-base">
              金額 *
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              className="h-10"
              {...register("price")}
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="reimburse" className="text-base">
              代墊
            </Label>
            <Input id="reimburse" className="h-10" {...register("reimburse")} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="description" className="text-base">
              備註
            </Label>
            <Textarea
              id="description"
              rows={6}
              className="min-h-36"
              {...register("description")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "新增中..." : "新增"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
