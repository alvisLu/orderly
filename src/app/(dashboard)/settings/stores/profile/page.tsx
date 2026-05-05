"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { apiGetStore, apiUpdateStore } from "@/app/api/stores/api";
import { apiUploadFile, apiUploadFromUrl } from "@/app/api/upload/api";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { openingSchema } from "@/modules/stores/dto";
import {
  EMPTY_OPENING,
  type Opening,
  type Store,
} from "@/modules/stores/types";
import { OpeningEditor } from "./components/opening-editor";

const storeFormSchema = z.object({
  name: z.string().min(1, "店名為必填"),
  phone: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  bannerURL: z.string().url("請輸入有效網址").optional().or(z.literal("")),
  opening: openingSchema,
});

type StoreFormInput = z.input<typeof storeFormSchema>;
type StoreFormValues = z.infer<typeof storeFormSchema>;

export default function StoreProfilePage() {
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, startLoading] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [isUploading, startUploading] = useTransition();
  const [isResetting, startResetting] = useTransition();
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
    setValue,
  } = useForm<StoreFormInput, unknown, StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: { opening: EMPTY_OPENING },
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
          opening: data.opening,
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

  function onInvalid(errs: FieldErrors<StoreFormValues>) {
    if (errs.opening) {
      toast.error(
        errs.opening.message ??
          errs.opening.root?.message ??
          "營業時間設定有誤",
      );
    }
  }

  function onSubmit(values: StoreFormValues) {
    startSaving(async () => {
      try {
        const updated = await apiUpdateStore({
          name: values.name,
          phone: values.phone || null,
          address: values.address || null,
          bannerURL: values.bannerURL || null,
          opening: values.opening,
        });
        setStore(updated);
        setBannerPreview(updated.bannerURL);
        reset({
          name: updated.name,
          phone: updated.phone ?? "",
          address: updated.address ?? "",
          bannerURL: updated.bannerURL ?? "",
          opening: updated.opening,
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
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="space-y-6"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="max-w-lg space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">店名</Label>
              <Input size="xl" id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">電話</Label>
              <Input size="xl" id="phone" {...register("phone")} />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">地址</Label>
              <Input size="xl" id="address" {...register("address")} />
              {errors.address && (
                <p className="text-sm text-destructive">
                  {errors.address.message}
                </p>
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

            {/* 取餐號碼 */}
            <div className="flex items-center gap-3">
              <Label>下一個取餐號碼: </Label>
              <span className="text-2xl font-bold tabular-nums">
                {store.orderCounter + 1}
              </span>
              <Button
                variant="secondary"
                disabled={isResetting || store.orderCounter === 0}
                onClick={() => {
                  startResetting(async () => {
                    try {
                      const updated = await apiUpdateStore({ orderCounter: 0 });
                      setStore(updated);
                      toast.success("取餐號碼已重置");
                    } catch {
                      toast.error("重置失敗");
                    }
                  });
                }}
              >
                {isResetting ? "重置中..." : "重置"}
              </Button>
            </div>

          </div>

          <div className="space-y-2">
          <Label>營業時間</Label>
          <p className="text-xs text-muted-foreground">
            未設定時段的日期視為公休
          </p>
          <Controller
            control={control}
            name="opening"
            render={({ field }) => (
              <OpeningEditor
                value={field.value as Opening}
                onChange={field.onChange}
              />
            )}
          />
          </div>
        </div>

        <div className="flex gap-2 pt-2 max-w-2xl">
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
                opening: store.opening,
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
            {isSaving ? <Spinner /> : "儲存"}
          </Button>
        </div>
      </form>
    </div>
  );
}
