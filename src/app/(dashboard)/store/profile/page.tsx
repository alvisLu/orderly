"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { apiGetStore, apiUpdateStore } from "@/app/api/stores/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Store } from "@/modules/stores/types";

const storeFormSchema = z.object({
  name: z.string().min(1, "店名為必填"),
  phone: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  bannerURL: z
    .string()
    .url("請輸入有效網址")
    .optional()
    .or(z.literal("")),
});

type StoreFormValues = z.infer<typeof storeFormSchema>;

export default function StoreProfilePage() {
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, startLoading] = useTransition();
  const [isSaving, startSaving] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
  });

  useEffect(() => {
    startLoading(async () => {
      try {
        const data = await apiGetStore();
        setStore(data);
        reset({
          name: data.name,
          phone: data.phone ?? "",
          address: data.address ?? "",
          bannerURL: data.bannerURL ?? "",
        });
      } catch {
        toast.error("無法載入店家資料");
      }
    });
  }, [reset]);

  function onSubmit(values: StoreFormValues) {
    startSaving(async () => {
      try {
        const updated = await apiUpdateStore({
          name: values.name,
          phone: values.phone || null,
          address: values.address || null,
          bannerURL: values.bannerURL || null,
        });
        setStore(updated);
        reset({
          name: updated.name,
          phone: updated.phone ?? "",
          address: updated.address ?? "",
          bannerURL: updated.bannerURL ?? "",
        });
        toast.success("店家資料已更新");
      } catch {
        toast.error("更新失敗");
      }
    });
  }

  if (isLoading || !store) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <p className="text-muted-foreground">載入中...</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-auto">
      <h1 className="text-xl font-semibold mb-6">店家資料</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-lg space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="name">店名</Label>
          <Input id="name" {...register("name")} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">電話</Label>
          <Input id="phone" {...register("phone")} />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">地址</Label>
          <Input id="address" {...register("address")} />
          {errors.address && (
            <p className="text-sm text-destructive">
              {errors.address.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bannerURL">Banner 圖片網址</Label>
          <Input id="bannerURL" {...register("bannerURL")} />
          {errors.bannerURL && (
            <p className="text-sm text-destructive">
              {errors.bannerURL.message}
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={!isDirty || isSaving}>
            {isSaving ? "儲存中..." : "儲存"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!isDirty}
            onClick={() =>
              reset({
                name: store.name,
                phone: store.phone ?? "",
                address: store.address ?? "",
                bannerURL: store.bannerURL ?? "",
              })
            }
          >
            取消
          </Button>
        </div>
      </form>
    </div>
  );
}
