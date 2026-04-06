"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Product } from "@/modules/products/types";
import type { LineItemOption } from "@/modules/orders/types";
import type { ProductTypeItem } from "@/modules/product-types/types";

type SelectedOptions = Record<string, ProductTypeItem[]>;

function buildOptions(
  product: Product,
  selectedOptions: SelectedOptions
): LineItemOption[] {
  return Object.entries(selectedOptions).flatMap(([typeId, items]) => {
    const typeEntry = product.productTypes.find(
      (pt) => pt.productType.id === typeId
    );
    return items.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: 1,
      productTypeName: typeEntry?.productType.name ?? "",
    }));
  });
}

interface ProductOptionDialogProps {
  product: Product | null;
  onConfirm: (options: LineItemOption[], quantity: number) => void;
  onClose: () => void;
}

export function ProductOptionDialog({
  product,
  onConfirm,
  onClose,
}: ProductOptionDialogProps) {
  const [selected, setSelected] = useState<SelectedOptions>({});
  const [quantity, setQuantity] = useState(1);
  const [initialized, setInitialized] = useState<string | null>(null);

  if (!product) return null;

  // Set default selection (first item of each productType)
  if (initialized !== product.id) {
    const defaults: SelectedOptions = {};
    for (const { productType } of product.productTypes) {
      const items = productType.items as unknown as ProductTypeItem[];
      const defaultItem = items.find((i) => i.isDefault);
      if (defaultItem) {
        defaults[productType.id] = [defaultItem];
      } else if (items.length > 0) {
        defaults[productType.id] = [items[0]];
      }
    }
    setSelected(defaults);
    setQuantity(1);
    setInitialized(product.id);
  }

  function selectOption(typeId: string, item: ProductTypeItem) {
    setSelected((prev) => {
      const current = prev[typeId] ?? [];
      const isSame = current.length === 1 && current[0].name === item.name;
      return { ...prev, [typeId]: isSame ? [] : [item] };
    });
  }

  function handleConfirm() {
    onConfirm(buildOptions(product!, selected), quantity);
    setSelected({});
    setQuantity(1);
  }

  const extraPrice = Object.values(selected)
    .flat()
    .reduce((s, i) => s + i.price, 0);
  const unitPrice = Number(product.price) + extraPrice;

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-full h-full max-w-none max-h-none rounded-none p-0 gap-0 flex flex-col overflow-hidden">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        {/* Product image */}
        <div className="relative w-full h-56 shrink-0 bg-muted">
          {product.imageUrls?.[0] ? (
            <Image
              src={product.imageUrls[0]}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : null}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Product info */}
          <div className="px-5 py-4">
            <p className="text-xl font-bold">{product.name}</p>
            <p className="text-lg font-semibold mt-1">
              ${Number(product.price)}
            </p>
            {product.description && (
              <p className="text-base text-muted-foreground mt-1 whitespace-pre-line">
                {product.description}
              </p>
            )}
          </div>

          <Separator />

          {/* Variant groups */}
          {product.productTypes.map(({ productType }) => {
            const items = productType.items as unknown as ProductTypeItem[];
            const currentSelected = selected[productType.id] ?? [];

            return (
              <div key={productType.id}>
                {/* Group header */}
                <div className="flex items-center gap-2 px-5 py-3 bg-muted/40">
                  <span className="rounded bg-foreground text-background text-base font-bold px-2 py-0.5">
                    {productType.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    必選 1 項
                  </span>
                </div>

                {/* Options */}
                {items.map((item) => {
                  const isSelected = currentSelected.some(
                    (i) => i.name === item.name
                  );
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => selectOption(productType.id, item)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 border-b last:border-b-0 focus:outline-none"
                    >
                      {/* Radio dot */}
                      <span
                        className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                          isSelected
                            ? "border-primary"
                            : "border-muted-foreground/40"
                        }`}
                      >
                        {isSelected && (
                          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </span>
                      <span
                        className={`flex-1 text-left text-base ${
                          isSelected ? "font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {item.name}
                      </span>
                      {item.price > 0 && (
                        <span
                          className={`text-base shrink-0 ${
                            isSelected
                              ? "text-primary font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          ${item.price}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* Quantity */}
          <div className="flex items-center justify-center gap-6 py-5">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-lg font-bold w-6 text-center">
              {quantity}
            </span>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sticky confirm button */}
        <div className="shrink-0 px-3 py-3 border-t bg-background flex flex-row gap-2">
          <Button
            size="xl"
            variant="outline"
            className="flex-1"
            onClick={handleConfirm}
          >
            取消
          </Button>
          <Button size="xl" className="flex-1" onClick={handleConfirm}>
            新增 {quantity} 到購物車 ${unitPrice * quantity}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
