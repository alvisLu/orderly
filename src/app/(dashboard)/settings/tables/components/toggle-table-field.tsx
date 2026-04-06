"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { apiUpdateTable } from "@/app/api/tables/api";
import type { Table } from "@/modules/tables/types";

interface Props {
  tableId: string;
  checked: boolean;
  onUpdated: (table: Table) => void;
}

export function ToggleTableField({ tableId, checked, onUpdated }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleChange(value: boolean) {
    startTransition(async () => {
      const updated = await apiUpdateTable(tableId, { isActive: value });
      onUpdated(updated);
    });
  }

  return (
    <Switch checked={checked} disabled={isPending} onCheckedChange={handleChange} />
  );
}
