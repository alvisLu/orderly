"use client";

import { ArrowDownNarrowWide, ArrowUpNarrowWide } from "lucide-react";
import { Button } from "@/components/ui/button";

type SortDirection = "asc" | "desc";

type SortDirectionPickerProps = {
  value: SortDirection;
  onChange: (next: SortDirection) => void;
};

const LABEL: Record<SortDirection, string> = {
  desc: "最新優先",
  asc: "最舊優先",
};

export function SortDirectionPicker({
  value,
  onChange,
}: SortDirectionPickerProps) {
  const Icon = value === "desc" ? ArrowDownNarrowWide : ArrowUpNarrowWide;
  return (
    <div className="space-y-1">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        aria-label={LABEL[value]}
        title={LABEL[value]}
        onClick={() => onChange(value === "desc" ? "asc" : "desc")}
      >
        <Icon className="h-4 w-4" />
      </Button>
    </div>
  );
}
