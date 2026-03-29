"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Scroller } from "@/components/ui/scroller";
import type { Product } from "@/modules/products/types";
import type { ProductTypeItem } from "@/modules/product-types/types";

export type SelectedOptions = Record<string, ProductTypeItem[]>;

export interface ProductConfigResult {
  quantity: number;
  price: number;
  selectedOptions: SelectedOptions;
}

interface Props {
  product: Product | null;
  onConfirm: (result: ProductConfigResult) => void;
  onClose: () => void;
}

type DiscountMode = "5折" | "6折" | "7折" | "8折" | "9折" | "自訂" | "免費";

const DISCOUNT_RATES: Record<DiscountMode, number | null> = {
  "5折": 0.5,
  "6折": 0.6,
  "7折": 0.7,
  "8折": 0.8,
  "9折": 0.9,
  自訂: null,
  免費: 0,
};

function buildDefaultOptions(product: Product): SelectedOptions {
  const result: SelectedOptions = {};
  for (const { productType } of product.productTypes) {
    const items = productType.items as unknown as ProductTypeItem[];
    const defaults = items.filter((i) => i.isDefault && !i.isDisable);
    if (defaults.length > 0) result[productType.id] = defaults;
  }
  return result;
}

type PriceKey = "price" | "price2" | "price3" | "price4" | "price5";

const PRICE_LABELS: Record<PriceKey, string> = {
  price: "原價",
  price2: "價2",
  price3: "價3",
  price4: "價4",
  price5: "價5",
};

export function ProductConfigSheet({ product, onConfirm, onClose }: Props) {
  const [priceKey, setPriceKey] = useState<PriceKey>("price");
  const [discountMode, setDiscountMode] = useState<DiscountMode | null>(null);
  const [customPrice, setCustomPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});

  // Reset state when product changes (including when same product is re-opened)
  const [lastProductId, setLastProductId] = useState<string | null>(null);
  if (!product && lastProductId !== null) {
    setLastProductId(null);
  }
  if (product && product.id !== lastProductId) {
    setLastProductId(product.id);
    setPriceKey("price");
    setDiscountMode(null);
    setCustomPrice(Number(product.price));
    setQuantity(1);
    setSelectedOptions(buildDefaultOptions(product));
  }

  if (!product) return null;

  const basePrice = Number(product[priceKey]);

  const computedPrice =
    discountMode === "自訂"
      ? customPrice
      : discountMode === "免費"
        ? 0
        : discountMode === null
          ? basePrice
          : Math.round(basePrice * DISCOUNT_RATES[discountMode]!);

  function toggleOption(
    productTypeId: string,
    item: ProductTypeItem,
    max: number
  ) {
    setSelectedOptions((prev) => {
      const current = prev[productTypeId] ?? [];
      const isSelected = current.some((i) => i.name === item.name);
      if (isSelected) {
        return {
          ...prev,
          [productTypeId]: current.filter((i) => i.name !== item.name),
        };
      }
      if (max === 1) return { ...prev, [productTypeId]: [item] };
      if (current.length >= max) return prev;
      return { ...prev, [productTypeId]: [...current, item] };
    });
  }

  function handleConfirm() {
    onConfirm({ quantity, price: computedPrice, selectedOptions });
  }

  return (
    <Sheet
      open={!!product}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={false}
        className="data-[side=right]:w-[34rem] data-[side=right]:sm:max-w-[34rem] p-0 gap-0 flex flex-col"
      >
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <SheetTitle className="text-lg">{product.name}</SheetTitle>
        </SheetHeader>

        <Scroller className="flex-1 px-4 py-3 space-y-4">
          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl w-10 shrink-0 text-sm text-muted-foreground">
                價格
              </span>
              <Input
                type="number"
                value={discountMode === "自訂" ? customPrice : computedPrice}
                onChange={(e) => {
                  setDiscountMode("自訂");
                  setCustomPrice(Number(e.target.value));
                }}
                size="xl"
                className="flex-1 text-right"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(DISCOUNT_RATES) as DiscountMode[]).map((mode) => (
                <Button
                  key={mode}
                  size="xl"
                  variant={discountMode === mode ? "default" : "outline"}
                  onClick={() => {
                    setDiscountMode(mode);
                    if (mode === "自訂") setCustomPrice(computedPrice);
                  }}
                >
                  {mode}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(PRICE_LABELS) as PriceKey[]).map((key) => {
                const val = Number(product[key]);
                return (
                  <Button
                    key={key}
                    size="xl"
                    variant={
                      priceKey === key && discountMode !== "免費"
                        ? "default"
                        : "outline"
                    }
                    onClick={() => {
                      setPriceKey(key);
                      if (key === "price" || discountMode === "免費")
                        setDiscountMode(null);
                    }}
                    disabled={val === 0}
                  >
                    {PRICE_LABELS[key]}
                    {key !== "price" && `：${val}`}
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Quantity */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl w-10 shrink-0 text-sm text-muted-foreground">
                數量
              </span>
              <Input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number(e.target.value)))
                }
                size="xl"
                className="flex-1 text-right"
              />
              <Button size="xl" onClick={() => setQuantity((q) => -q)}>
                +/-
              </Button>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((n) => {
                const val = quantity < 0 ? -n : n;
                return (
                  <Button
                    key={n}
                    size="xl"
                    variant={quantity === val ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setQuantity(val)}
                  >
                    {val}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Product Types */}
          {product.productTypes.map(({ productType }) => {
            const items = productType.items as unknown as ProductTypeItem[];
            const enabledItems = items.filter((i) => !i.isDisable);
            const selected = selectedOptions[productType.id] ?? [];
            return (
              <div key={productType.id} className="space-y-2">
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xl font-medium">
                    {productType.name}
                  </span>
                  <div className="flex gap-1">
                    <Badge variant="secondary">必選 {productType.min}</Badge>
                    <Badge variant="secondary">可選 {productType.max}</Badge>
                  </div>
                </div>
                <Scroller orientation="horizontal" className="flex gap-1.5">
                  {enabledItems.map((item) => {
                    const isSelected = selected.some(
                      (i) => i.name === item.name
                    );
                    return (
                      <Button
                        key={item.name}
                        size="xl"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() =>
                          toggleOption(productType.id, item, productType.max)
                        }
                      >
                        {item.name}
                        {item.price !== 0 && ` $${item.price}`}
                      </Button>
                    );
                  })}
                </Scroller>
              </div>
            );
          })}
        </Scroller>

        <SheetFooter className="shrink-0 flex-row justify-between border-t px-4 py-3 gap-2">
          <Button
            size="xl"
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            關閉
          </Button>
          <Button size="xl" className="flex-1" onClick={handleConfirm}>
            加入購物車
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
