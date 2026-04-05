"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { apiGetStore, apiUpdateStore } from "@/app/api/stores/api";
import { apiUploadFile, apiUploadFromUrl } from "@/app/api/upload/api";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Store } from "@/modules/stores/types";

const storeFormSchema = z.object({
  name: z.string().min(1, "店名為必填"),
  phone: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  bannerURL: z.string().url("請輸入有效網址").optional().or(z.literal("")),
});

type StoreFormInput = z.input<typeof storeFormSchema>;
type StoreFormValues = z.infer<typeof storeFormSchema>;

export default function StoreProfilePage() {
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, startLoading] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [isUploading, startUploading] = useTransition();
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    setValue,
  } = useForm<StoreFormInput, unknown, StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
  });

  useEffect(() => {
    startLoading(async () => {
      try {
        const data = await apiGetStore();
        setStore(data);
        setBannerPreview(data.bannerURL);
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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    startUploading(async () => {
      try {
        const url = await apiUploadFile(file, "stores");
        setValue("bannerURL", url, { shouldDirty: true });
        setBannerPreview(url);
        toast.success("圖片上傳成功");
      } catch {
        toast.error("圖片上傳失敗");
      }
    });
  }

  async function handleUrlUpload() {
    if (!urlInput.trim()) return;
    startUploading(async () => {
      try {
        const url = await apiUploadFromUrl(urlInput.trim(), "stores");
        setValue("bannerURL", url, { shouldDirty: true });
        setBannerPreview(url);
        setUrlInput("");
        toast.success("圖片上傳成功");
      } catch {
        toast.error("圖片上傳失敗");
      }
    });
  }

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
        setBannerPreview(updated.bannerURL);
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
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">店名</Label>
          <Input size="xl" id="name" {...register("name")} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">電話</Label>
          <Input size="xl" id="phone" {...register("phone")} />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">地址</Label>
          <Input size="xl" id="address" {...register("address")} />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label>Banner 圖片</Label>

          {bannerPreview && (
            <Image
              src={bannerPreview}
              alt="Banner preview"
              width={448}
              height={160}
              unoptimized
              className="w-full max-w-md h-40 object-cover rounded-md border"
            />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="xl"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? "上傳中..." : "選擇檔案"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Input
              placeholder="或貼上圖片網址"
              size="lg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleUrlUpload();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="xl"
              disabled={isUploading || !urlInput.trim()}
              onClick={handleUrlUpload}
            >
              上傳
            </Button>
          </div>

          <input type="hidden" {...register("bannerURL")} />
          {errors.bannerURL && (
            <p className="text-sm text-destructive">
              {errors.bannerURL.message}
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1"
            size="xl"
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
          <Button
            size="xl"
            className="flex-1"
            type="submit"
            disabled={!isDirty || isSaving}
          >
            {isSaving ? "儲存中..." : "儲存"}
          </Button>
        </div>
      </form>
    </div>
  );
}
