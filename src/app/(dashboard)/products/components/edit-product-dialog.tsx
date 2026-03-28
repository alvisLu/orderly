"use client";

import { useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiUpdateProduct, apiDeleteProduct } from "@/app/api/products/api";
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
import type { Product } from "@/modules/products/types";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(1, "請輸入商品名稱"),
  price: z.coerce.number().min(0, "價格不能為負數"),
  cost: z.coerce.number().min(0),
  description: z.string().optional(),
  categoryId: z.string().nullable(),
  isPosAvailable: z.boolean(),
  isMenuAvailable: z.boolean(),
  isFavorite: z.boolean(),
  productTypeIds: z.array(z.string()),
});

type FormValues = z.infer<typeof schema>;

export function EditProductDialog({
  product,
  categories,
  productTypes,
}: {
  product: Product;
  categories: Category[];
  productTypes: ProductType[];
}) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await apiDeleteProduct(product.id);
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("刪除商品失敗");
    } finally {
      setIsDeleting(false);
    }
  }

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      name: product.name,
      price: product.price,
      cost: product.cost,
      description: product.description ?? "",
      categoryId: product.categoryId,
      isPosAvailable: product.isPosAvailable,
      isMenuAvailable: product.isMenuAvailable,
      isFavorite: product.isFavorite,
      productTypeIds: product.productTypes.map((pt) => pt.productTypeId),
    },
  });

  const [categoryId, booleanValues, productTypeIds] = [
    useWatch({ control, name: "categoryId" }),
    useWatch({
      control,
      name: ["isPosAvailable", "isMenuAvailable", "isFavorite"],
    }),
    useWatch({ control, name: "productTypeIds" }),
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
    await apiUpdateProduct(product.id, values);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon" className="h-7 w-7">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">修改商品</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-base">
              商品名稱 *
            </Label>
            <Input id="name" className="h-10" {...register("name")} />
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
                className="h-10"
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

          <div className="flex justify-between pt-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isDeleting ? "刪除中..." : "刪除商品"}
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "儲存中..." : "儲存"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
