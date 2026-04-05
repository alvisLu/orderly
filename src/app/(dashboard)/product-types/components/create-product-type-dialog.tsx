"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { apiCreateProductType } from "@/app/api/product-types/api";
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

const optionSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.coerce.number().nonnegative().default(0),
  isDefault: z.boolean().default(false),
  isDisable: z.boolean().default(false),
});

const schema = z.object({
  name: z.string().min(1, "請輸入類型名稱"),
  productIds: z.array(z.string()).default([]),
  max: z.string().default(""),
  min: z.string().default(""),
  options: z.array(optionSchema).default([]),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.infer<typeof schema>;

let tempId = 0;
function nextId() {
  return `new-${++tempId}`;
}

interface Props {
  products: Product[];
  onCreated: (productType: ProductType) => void;
}

export function CreateProductTypeDialog({ products, onCreated }: Props) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { options: [], productIds: [], max: "", min: "" },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "options",
  });
  const max = useWatch({ control, name: "max" });
  const min = useWatch({ control, name: "min" });
  const productIds = useWatch({ control, name: "productIds" }) ?? [];

  const maxOptions = Array.from({ length: fields.length + 1 }, (_, i) => i);

  function addProduct(id: string) {
    if (!productIds.includes(id)) setValue("productIds", [...productIds, id]);
  }

  function removeProduct(id: string) {
    setValue(
      "productIds",
      productIds.filter((v) => v !== id)
    );
  }

  async function onSubmit(values: FormValues) {
    try {
      const productType = await apiCreateProductType({
        name: values.name,
        productIds: values.productIds,
        max: values.max ? parseInt(values.max) : undefined,
        min: values.min ? parseInt(values.min) : undefined,
        items: values.options.map(({ name, price, isDefault, isDisable }) => ({
          name,
          price,
          isDefault,
          isDisable,
        })),
      });

      reset();
      setOpen(false);
      onCreated(productType);
    } catch {
      toast.error("新增選項失敗");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">新增選項</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            新增商品選項
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
          <div className="space-y-1">
            <Label>類型(必填)</Label>
            <Input className="h-10" placeholder="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* 套用商品（多選） */}
          <div className="space-y-1">
            <Label>套用商品</Label>
            <Select value="" onValueChange={addProduct}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="新增套用商品" />
              </SelectTrigger>
              <SelectContent>
                {products
                  .filter((p) => !productIds.includes(p.id))
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
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
                        {...register(`options.${i}.name`)}
                      />
                      <Input
                        type="number"
                        className="h-9 w-20"
                        {...register(`options.${i}.price`)}
                      />
                      <Controller
                        control={control}
                        name={`options.${i}.isDefault`}
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
                                      setValue(`options.${j}.isDefault`, false)
                                  );
                              }}
                            />
                            預設
                          </label>
                        )}
                      />
                      <Controller
                        control={control}
                        name={`options.${i}.isDisable`}
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
                  id: nextId(),
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

          {/* 最多選 / 必選 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>最多選幾項</Label>
              <Select value={max} onValueChange={(v) => setValue("max", v)}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="最多選幾項" />
                </SelectTrigger>
                <SelectContent>
                  {maxOptions.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n === 0 ? "不限" : `${n} 項`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>必選幾項</Label>
              <Select value={min} onValueChange={(v) => setValue("min", v)}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="必選幾項" />
                </SelectTrigger>
                <SelectContent>
                  {maxOptions.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n === 0 ? "可不選" : `${n} 項`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
