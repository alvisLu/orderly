"use client";

import { useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { apiCreateProduct } from "@/app/api/products/api";
import type { Category } from "@/modules/categories/types";
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
  name: z.string().min(1, "請輸入商品名稱"),
  price: z.coerce.number().min(0, "價格不能為負數"),
  cost: z.coerce.number().min(0).default(0),
  description: z.string().optional(),
  category_id: z.string().nullable().default(null),
  is_pos_available: z.boolean().default(true),
  is_menu_available: z.boolean().default(true),
  is_favorite: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

export function CreateProductDialog({
  categories,
}: {
  categories: Category[];
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
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cost: 0,
      category_id: null,
      is_pos_available: true,
      is_menu_available: true,
      is_favorite: false,
    },
  });

  const [categoryId, booleanValues] = [
    useWatch({ control, name: "category_id" }),
    useWatch({
      control,
      name: ["is_pos_available", "is_menu_available", "is_favorite"],
    }),
  ];

  async function onSubmit(values: FormValues) {
    try {
      await apiCreateProduct({
        ...values,
        image_urls: [],
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="price" className="text-base">
                售價 *
              </Label>
              <Input
                id="price"
                type="number"
                className="h-10 "
                {...register("price")}
              />
              {errors.price && (
                <p className="text-sm text-destructive">
                  {errors.price.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="cost" className="text-base">
                成本
              </Label>
              <Input
                id="cost"
                type="number"
                className="h-10"
                {...register("cost")}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-base">目錄</Label>
            <Select
              value={categoryId ?? ""}
              onValueChange={(v) => setValue("category_id", v || null)}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="選擇目錄" />
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

          <div className="space-y-2">
            {(
              [
                { key: "is_pos_available", label: "POS 上架" },
                { key: "is_menu_available", label: "菜單上架" },
                { key: "is_favorite", label: "我的最愛" },
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
