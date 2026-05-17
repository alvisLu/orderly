"use client";

import type { ReactNode } from "react";
import { DateNavigator, DateRangeField } from "@/components/shared/date-fields";

type DateRangeValue = { from: string; to: string };

type DateRangeFilterBarProps = {
  range: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
  clamp?: boolean;
  unit: "day" | "month";
  onOffset: (offset: number) => void;
  onCurrent: () => void;
  jump?: number;
  currentLabel?: string;
  children?: ReactNode;
};

export function DateRangeFilterBar({
  range,
  onChange,
  clamp = false,
  unit,
  onOffset,
  onCurrent,
  jump,
  currentLabel,
  children,
}: DateRangeFilterBarProps) {
  return (
    <div className="flex flex-nowrap items-end gap-2 mb-4 overflow-x-auto">
      <DateRangeField clamp={clamp} value={range} onChange={onChange} />
      <DateNavigator
        unit={unit}
        onOffset={onOffset}
        onCurrent={onCurrent}
        jump={jump}
        currentLabel={currentLabel}
      />
      {children}
    </div>
  );
}
