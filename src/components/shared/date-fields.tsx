"use client";

import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { toast } from "sonner";
import dayjs from "@/lib/dayjs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DateFieldProps = {
  value: string;
  onChange: (next: string) => void;
  disabled?: (date: Date) => boolean;
  placeholder?: string;
  triggerClassName?: string;
};

export function DateField({
  value,
  onChange,
  disabled,
  placeholder = "選擇日期",
  triggerClassName,
}: DateFieldProps) {
  return (
    <div className="space-y-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-9 w-40 justify-start font-normal",
              !value && "text-muted-foreground",
              triggerClassName
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value || placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ? dayjs(value).toDate() : undefined}
            defaultMonth={value ? dayjs(value).toDate() : undefined}
            onSelect={(d) => {
              if (!d) return;
              onChange(dayjs(d).format("YYYY-MM-DD"));
            }}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

type DateRangeValue = { from: string; to: string };

type DateRangeFieldProps = {
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
  clamp?: boolean;
};

export function DateRangeField({
  value,
  onChange,
  clamp = true,
}: DateRangeFieldProps) {
  function handleFromChange(next: string) {
    if (value.to && next > value.to) {
      if (clamp) {
        onChange({ from: next, to: next });
      } else {
        toast.error("開始日期不可晚於結束日期");
      }
      return;
    }
    onChange({ from: next, to: value.to });
  }

  function handleToChange(next: string) {
    if (value.from && value.from > next) {
      if (clamp) {
        onChange({ from: next, to: next });
      } else {
        toast.error("結束日期不可早於開始日期");
      }
      return;
    }
    onChange({ from: value.from, to: next });
  }

  return (
    <>
      <DateField
        value={value.from}
        onChange={handleFromChange}
        disabled={
          clamp
            ? (d) => !!value.to && dayjs(d).isAfter(dayjs(value.to), "day")
            : undefined
        }
      />
      <DateField
        value={value.to}
        onChange={handleToChange}
        disabled={
          clamp
            ? (d) => !!value.from && dayjs(d).isBefore(dayjs(value.from), "day")
            : undefined
        }
      />
    </>
  );
}

type DateNavigatorProps = {
  unit: "day" | "month";
  onOffset: (offset: number) => void;
  onCurrent: () => void;
  jump?: number;
  currentLabel?: string;
};

export function DateNavigator({
  unit,
  onOffset,
  onCurrent,
  jump,
  currentLabel,
}: DateNavigatorProps) {
  const todayLabel = currentLabel ?? (unit === "day" ? "今天" : "本月");
  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {jump !== undefined && (
          <Button size="lg" variant="outline" onClick={() => onOffset(-jump)}>
            <ChevronsLeft />
          </Button>
        )}
        <Button size="lg" variant="outline" onClick={() => onOffset(-1)}>
          <ChevronLeft />
        </Button>
        <Button size="lg" variant="outline" onClick={onCurrent}>
          {todayLabel}
        </Button>
        <Button size="lg" variant="outline" onClick={() => onOffset(1)}>
          <ChevronRight />
        </Button>
        {jump !== undefined && (
          <Button size="lg" variant="outline" onClick={() => onOffset(jump)}>
            <ChevronsRight />
          </Button>
        )}
      </div>
    </div>
  );
}
