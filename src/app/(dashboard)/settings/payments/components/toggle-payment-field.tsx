"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { apiUpdatePayment } from "@/app/api/payments/api";
import type { Payment } from "@/modules/payments/types";

interface Props {
  paymentId: string;
  field: "isPosAvailable" | "isMenuAvailable";
  checked: boolean;
  onUpdated: (payment: Payment) => void;
}

export function TogglePaymentField({ paymentId, field, checked, onUpdated }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleChange(value: boolean) {
    startTransition(async () => {
      const updated = await apiUpdatePayment(paymentId, { [field]: value });
      onUpdated(updated);
    });
  }

  return (
    <Switch checked={checked} disabled={isPending} onCheckedChange={handleChange} />
  );
}
