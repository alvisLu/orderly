"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  apiUpdateProductType,
  apiDeleteProductType,
  apiGetProductType,
} from "@/app/api/product-types/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from "@/components/ui/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ProductType } from "@/modules/product-types/types";
import type { Product } from "@/modules/products/types";

const itemSchema = z.object({
  name: z.string(),
  price: z.number().nonnegative().default(0),
  isDefault: z.boolean().default(false),
  isDisable: z.boolean().default(false),
});

const schema = z.object({
  name: z.string().min(1, "請輸入選項名稱"),
  max: z.string(),
  min: z.string(),
  items: z.array(itemSchema).default([]),
  productIds: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  productType: ProductType;
  products: Product[];
  onUpdated: (productType: ProductType) => void;
  onDeleted: (id: string) => void;
}

export function EditProductTypeDialog({
  productType,
  products,
  onUpdated,
  onDeleted,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema as never),
    defaultValues: {
      name: productType.name,
      max: String(productType.max),
      min: String(productType.min),
      items: productType.items,
      productIds: [],
    },
  });

  const productIds = useWatch({ control, name: "productIds" });

  async function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      const full = await apiGetProductType(productType.id);
      reset({
        name: full.name,
        max: String(full.max),
        min: String(full.min),
        items: full.items,
        productIds:
          full.products?.map(
            (p) => (p as { productId: string; product: Product }).productId
          ) ?? [],
      });
    }
  }

  function addProduct(id: string) {
    if (!productIds.includes(id)) setValue("productIds", [...productIds, id]);
  }

  function removeProduct(id: string) {
    setValue(
      "productIds",
      productIds.filter((v) => v !== id)
    );
  }

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "items",
  });

  async function onSubmit(values: FormValues) {
    try {
      const updated = await apiUpdateProductType(productType.id, {
        name: values.name,
        max: values.max ? parseInt(values.max) : undefined,
        min: values.min ? parseInt(values.min) : undefined,
        items: values.items,
        productIds: values.productIds,
      });
      setOpen(false);
      onUpdated(updated);
    } catch {
      toast.error("修改選項失敗");
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await apiDeleteProductType(productType.id);
      setOpen(false);
      onDeleted(productType.id);
    } catch {
      toast.error("刪除選項失敗");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon" className="h-7 w-7">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">修改選項</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-base">
              名稱 *
            </Label>
            <Input id="name" className="h-10" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>套用商品</Label>
            {(() => {
              const available = products.filter(
                (p) => !productIds.includes(p.id)
              );
              return (
                <Select
                  value=""
                  onValueChange={addProduct}
                  disabled={available.length === 0}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue
                      placeholder={
                        available.length === 0 ? "沒有資料" : "新增套用商品"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {available.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            })()}
            {productIds.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {productIds.map((id) => {
                  const p = products.find((p) => p.id === id);
                  return p ? (
                    <span
                      key={id}
                      className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full"
                    >
                      {p.name}
                      <button type="button" onClick={() => removeProduct(id)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="min" className="text-base">
                最少選
              </Label>
              <Input
                id="min"
                type="number"
                className="h-10"
                {...register("min")}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="max" className="text-base">
                最多選
              </Label>
              <Input
                id="max"
                type="number"
                className="h-10"
                {...register("max")}
              />
            </div>
          </div>

          {/* 選項 */}
          <div className="space-y-2">
            <Label>選項</Label>
            <Sortable
              value={fields}
              onMove={({ activeIndex, overIndex }) =>
                move(activeIndex, overIndex)
              }
              getItemValue={(f) => f.id}
              orientation="vertical"
            >
              <SortableContent className="space-y-2">
                {fields.map((field, i) => (
                  <SortableItem key={field.id} value={field.id}>
                    <div className="flex items-center gap-2">
                      <SortableItemHandle>
                        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                      </SortableItemHandle>
                      <Input
                        className="h-9 flex-1"
                        placeholder="option"
                        {...register(`items.${i}.name`)}
                      />
                      <Input
                        type="number"
                        className="h-9 w-20"
                        {...register(`items.${i}.price`)}
                      />
                      <Controller
                        control={control}
                        name={`items.${i}.isDefault`}
                        render={({ field }) => (
                          <label className="flex items-center gap-1 text-sm whitespace-nowrap cursor-pointer">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(v) => {
                                field.onChange(!!v);
                                if (v)
                                  fields.forEach(
                                    (_, j) =>
                                      j !== i &&
                                      setValue(`items.${j}.isDefault`, false)
                                  );
                              }}
                            />
                            預設
                          </label>
                        )}
                      />
                      <Controller
                        control={control}
                        name={`items.${i}.isDisable`}
                        render={({ field }) => (
                          <label className="flex items-center gap-1 text-sm whitespace-nowrap cursor-pointer">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(v) => field.onChange(!!v)}
                            />
                            停用
                          </label>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => remove(i)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </SortableItem>
                ))}
              </SortableContent>
              <SortableOverlay>
                <div className="h-9 rounded-md bg-primary/10 border" />
              </SortableOverlay>
            </Sortable>

            <Button
              type="button"
              size="sm"
              onClick={() =>
                append({
                  name: "",
                  price: 0,
                  isDefault: false,
                  isDisable: false,
                })
              }
            >
              <Plus />
              增加選項
            </Button>
          </div>

          <div className="flex justify-between pt-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isDeleting ? "刪除中..." : "刪除選項"}
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
