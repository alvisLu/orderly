"use client";

import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MonthPickerProps = {
  value: number;
  onChange: (month: number) => void;
};

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  return (
    <div className="space-y-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-9 w-20 justify-between">
            {value}月
            <ChevronDownIcon className="ml-1 h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-20 w-20">
          <DropdownMenuRadioGroup
            value={String(value)}
            onValueChange={(val) => onChange(Number(val))}
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
  );
}
