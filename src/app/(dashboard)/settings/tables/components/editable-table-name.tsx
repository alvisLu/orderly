"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { apiUpdateTable } from "@/app/api/tables/api";
import { Input } from "@/components/ui/input";
import type { Table } from "@/modules/tables/types";

interface Props {
  tableId: string;
  name: string;
  onUpdated: (table: Table) => void;
  onPendingChange?: (pending: boolean) => void;
}

export function EditableTableName({
  tableId,
  name,
  onUpdated,
  onPendingChange,
}: Props) {
  const [value, setValue] = useState(name);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(name);
  }, [name]);

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  function commit() {
    const next = value.trim();
    if (!next || next === name) {
      setValue(name);
      return;
    }
    startTransition(async () => {
      try {
        const updated = await apiUpdateTable(tableId, { name: next });
        onUpdated(updated);
      } catch {
        toast.error("修改桌位名稱失敗");
        setValue(name);
      }
    });
  }

  return (
    <Input
      value={value}
      disabled={isPending}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
        } else if (e.key === "Escape") {
          setValue(name);
          (e.target as HTMLInputElement).blur();
        }
      }}
      className="h-11 text-lg font-medium"
    />
  );
}
