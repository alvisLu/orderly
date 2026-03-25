'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { apiUpdateProduct } from '@/app/api/products/api';

interface ToggleProductFieldProps {
  productId: string;
  field: 'is_pos_available' | 'is_menu_available' | 'is_favorite';
  checked: boolean;
}

export function ToggleProductField({ productId, field, checked }: ToggleProductFieldProps) {
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
