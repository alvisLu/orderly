"use client";

import { useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { apiCreateProduct } from "@/app/api/products/api";
import type { Category } from "@/modules/categories/types";
import type { ProductType } from "@/modules/product-types/types";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(1, "請輸入商品名稱").max(50, "商品名稱不能超過50個字符"),
  price: z.coerce.number(),
  price2: z.coerce.number().default(0),
  price3: z.coerce.number().default(0),
  price4: z.coerce.number().default(0),
  price5: z.coerce.number().default(0),
  cost: z.coerce.number().min(0, "成本不能為負數").default(0),
  description: z.string().optional(),
  categoryId: z.string().nullable().default(null),
  isPosAvailable: z.boolean().default(true),
  isMenuAvailable: z.boolean().default(true),
  isFavorite: z.boolean().default(false),
  productTypeIds: z.array(z.string()).default([]),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.infer<typeof schema>;

export function CreateProductDialog({
  categories,
  productTypes,
}: {
  categories: Category[];
  productTypes: ProductType[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cost: 0,
      categoryId: null,
      isPosAvailable: true,
      isMenuAvailable: true,
      isFavorite: false,
      productTypeIds: [],
    },
  });

  const [categoryId, booleanValues, productTypeIds] = [
    useWatch({ control, name: "categoryId" }),
    useWatch({
      control,
      name: ["isPosAvailable", "isMenuAvailable", "isFavorite"],
    }),
    useWatch({ control, name: "productTypeIds" }) ?? [],
  ];

  function addProductType(id: string) {
    if (!productTypeIds.includes(id))
      setValue("productTypeIds", [...productTypeIds, id]);
  }

  function removeProductType(id: string) {
    setValue(
      "productTypeIds",
      productTypeIds.filter((v) => v !== id)
    );
  }

  async function onSubmit(values: FormValues) {
    try {
      await apiCreateProduct({
        ...values,
        imageUrls: [],
        description: values.description ?? null,
      });
      reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(`新增商品失敗: ${error}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg" className="mb-4">
          新增商品
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">新增商品</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-base">
              商品名稱 *
            </Label>
            <Input id="name" className="h-10 " {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-6 gap-4">
            {(
              [
                { key: "price", label: "售價 *" },
                { key: "price2", label: "價格 2" },
                { key: "price3", label: "價格 3" },
                { key: "price4", label: "價格 4" },
                { key: "price5", label: "價格 5" },
                { key: "cost", label: "成本" },
              ] as const
            ).map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <Label htmlFor={key} className="text-base">
                  {label}
                </Label>
                <Input
                  id={key}
                  type="number"
                  className="h-10"
                  {...register(key)}
                />
                {errors[key] && (
                  <p className="text-sm text-destructive">
                    {errors[key].message}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <Label className="text-base">目錄</Label>
            <Select
              value={categoryId ?? ""}
              onValueChange={(v) => setValue("categoryId", v || null)}
              disabled={categories.length === 0}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue
                  placeholder={
                    categories.length === 0 ? "沒有資料" : "選擇目錄"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description" className="text-base">
              描述
            </Label>
            <Textarea
              id="description"
              className="h-40"
              {...register("description")}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-base">加料選項</Label>
            {(() => {
              const available = productTypes.filter(
                (pt) => !productTypeIds.includes(pt.id)
              );
              return (
                <Select
                  value=""
                  onValueChange={addProductType}
                  disabled={available.length === 0}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue
                      placeholder={
                        available.length === 0 ? "沒有資料" : "新增選項"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {available.map((pt) => (
                      <SelectItem key={pt.id} value={pt.id}>
                        {pt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            })()}
            {productTypeIds.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {productTypeIds.map((id) => {
                  const pt = productTypes.find((p) => p.id === id);
                  return pt ? (
                    <span
                      key={id}
                      className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full"
                    >
                      {pt.name}
                      <button
                        type="button"
                        onClick={() => removeProductType(id)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {(
              [
                { key: "isPosAvailable", label: "POS 上架" },
                { key: "isMenuAvailable", label: "菜單上架" },
                { key: "isFavorite", label: "我的最愛" },
              ] as const
            ).map(({ key, label }, i) => (
              <div key={key} className="flex items-center justify-between">
                <Label className="text-base">{label}</Label>
                <Switch
                  checked={booleanValues[i]}
                  onCheckedChange={(v) => setValue(key, v)}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "新增中..." : "新增"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
