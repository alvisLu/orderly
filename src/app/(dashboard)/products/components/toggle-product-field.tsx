"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { apiUpdateProduct } from "@/app/api/products/api";

interface ToggleProductFieldProps {
  productId: string;
  field: "isPosAvailable" | "isMenuAvailable" | "isFavorite";
  checked: boolean;
}

export function ToggleProductField({
  productId,
  field,
  checked,
}: ToggleProductFieldProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleChange(value: boolean) {
    await apiUpdateProduct(productId, { [field]: value });
    startTransition(() => router.refresh());
  }

  return (
    <Switch
      checked={checked}
      disabled={isPending}
      onCheckedChange={handleChange}
    />
  );
}
