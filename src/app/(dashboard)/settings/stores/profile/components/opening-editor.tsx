"use client";

import { ChevronDownIcon, PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Opening, TimeSlot, WeekDay } from "@/modules/stores/types";

const DAY_KEYS: WeekDay[] = ["1", "2", "3", "4", "5", "6", "0"];

const DAY_LABELS: Record<WeekDay, string> = {
  "0": "週日",
  "1": "週一",
  "2": "週二",
  "3": "週三",
  "4": "週四",
  "5": "週五",
  "6": "週六",
};

const TIME_OPTIONS = (() => {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
})();

function nextDefaultSlot(existing: TimeSlot[]): TimeSlot | null {
  if (existing.length === 0) return { open: "09:00", close: "18:00" };
  const last = existing[existing.length - 1];
  const startIdx = TIME_OPTIONS.indexOf(last.close);
  if (startIdx < 0 || startIdx >= TIME_OPTIONS.length - 1) return null;
  const endIdx = Math.min(startIdx + 6, TIME_OPTIONS.length - 1);
  return { open: TIME_OPTIONS[startIdx], close: TIME_OPTIONS[endIdx] };
}

interface TimePickerProps {
  value: string;
  onChange: (v: string) => void;
  filter?: (option: string) => boolean;
}

function TimePicker({ value, onChange, filter }: TimePickerProps) {
  const options = filter ? TIME_OPTIONS.filter(filter) : TIME_OPTIONS;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-24 justify-between tabular-nums"
        >
          {value}
          <ChevronDownIcon className="ml-1 h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-72 w-24 min-w-24 overflow-y-auto"
      >
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((t) => (
            <DropdownMenuRadioItem
              key={t}
              value={t}
              className="py-1 text-sm tabular-nums"
            >
              {t}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface OpeningEditorProps {
  value: Opening;
  onChange: (v: Opening) => void;
}

export function OpeningEditor({ value, onChange }: OpeningEditorProps) {
  function setDay(day: WeekDay, slots: TimeSlot[]) {
    onChange({ weekly: { ...value.weekly, [day]: slots } });
  }

  function addSlot(day: WeekDay) {
    const next = nextDefaultSlot(value.weekly[day]);
    if (!next) return;
    setDay(day, [...value.weekly[day], next]);
  }

  function updateSlot(day: WeekDay, idx: number, patch: Partial<TimeSlot>) {
    const slots = value.weekly[day].map((s, i) =>
      i === idx ? { ...s, ...patch } : s,
    );
    setDay(day, slots);
  }

  function removeSlot(day: WeekDay, idx: number) {
    setDay(
      day,
      value.weekly[day].filter((_, i) => i !== idx),
    );
  }

  function applyToAll(day: WeekDay) {
    const slots = value.weekly[day];
    const newWeekly = Object.fromEntries(
      DAY_KEYS.map((k) => [k, slots.map((s) => ({ ...s }))]),
    ) as Opening["weekly"];
    onChange({ weekly: newWeekly });
  }

  return (
    <div className="space-y-3 rounded-md border p-4">
      {DAY_KEYS.map((day) => {
        const slots = value.weekly[day];
        const canAdd = nextDefaultSlot(slots) !== null;
        return (
          <div
            key={day}
            className="flex items-start gap-3 border-b pb-3 last:border-b-0 last:pb-0"
          >
            <div className="w-12 shrink-0 pt-2 text-sm font-medium">
              {DAY_LABELS[day]}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              {slots.length === 0 ? (
                <p className="py-2 text-sm text-muted-foreground">公休</p>
              ) : (
                slots.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <TimePicker
                      value={slot.open}
                      onChange={(v) => updateSlot(day, idx, { open: v })}
                    />
                    <span className="text-muted-foreground">–</span>
                    <TimePicker
                      value={slot.close}
                      onChange={(v) => updateSlot(day, idx, { close: v })}
                      filter={(t) => t > slot.open}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => removeSlot(day, idx)}
                      aria-label="移除時段"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  disabled={!canAdd}
                  onClick={() => addSlot(day)}
                >
                  <PlusIcon className="mr-1 h-3 w-3" />
                  新增時段
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => applyToAll(day)}
                >
                  套用至全週
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
