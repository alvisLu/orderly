"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CircleCheckBig,
  CircleDollarSign,
  Minus,
  Plus,
  Recycle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ScrollSpy,
  ScrollSpyLink,
  ScrollSpyNav,
  ScrollSpySection,
  ScrollSpyViewport,
} from "@/components/ui/scroll-spy";
import type { Product } from "@/modules/products/types";
import type { LineItemOption } from "@/modules/orders/types";
import type { ProductTypeItem } from "@/modules/product-types/types";
import { Button } from "@/components/ui/button";

const NAV_HEIGHT = 60;
const UNCATEGORIZED_ID = "uncategorized";

type SelectedOptions = Record<string, ProductTypeItem[]>;

interface CartItem {
  product: Product;
  quantity: number;
  productOptions: LineItemOption[];
}

interface CategoryGroup {
  id: string;
  name: string;
  products: Product[];
}

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

function itemUnitPrice(product: Product, options: LineItemOption[]): number {
  return (
    Number(product.price) +
    options.reduce((s, o) => s + o.price * o.quantity, 0)
  );
}

// ── Product option dialog ─────────────────────────────────────────────────────

interface ProductOptionDialogProps {
  product: Product | null;
  onConfirm: (options: LineItemOption[], quantity: number) => void;
  onClose: () => void;
}

function ProductOptionDialog({
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

// ── Main component ────────────────────────────────────────────────────────────

interface StoreInfo {
  name: string;
  phone?: string;
  address?: string;
  description?: string;
  bannerUrl?: string;
  businessHours?: { day: string; hours: string }[];
}

function OrderSuccess({
  tableName,
  onContinue,
}: {
  tableName: string;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center">
      <div className=" flex flex-col items-start gap-2">
        <p className="flex items-start gap-2 text-muted-foreground">
          <CircleCheckBig className="text-primary" />
          桌號：{tableName}，訂單已送出...
        </p>
        <p className="text-2xl font-bold flex items-center gap-2">
          <CircleDollarSign className="text-yellow-500" />
          請到櫃檯結帳
        </p>
        <p className="flex items-start gap-2 text-muted-foreground">
          <Recycle className="text-secondary" />
          用餐完請將餐盤回收
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={onContinue} size="xl">
          繼續點餐
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            // TODO: review order
          }}
          size="xl"
        >
          查看訂單
        </Button>
      </div>
    </div>
  );
}

export function MenuClient({
  tableName,
  products,
  store,
}: {
  tableName: string;
  products: Product[];
  store?: StoreInfo;
}) {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userNote, setUserNote] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [configProduct, setConfigProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ordered, setOrdered] = useState(false);

  // Group products by category
  const groups: CategoryGroup[] = (() => {
    const map = new Map<string, CategoryGroup>();
    for (const p of products) {
      const id = p.category?.id ?? UNCATEGORIZED_ID;
      const name = p.category?.name ?? "其他";
      if (!map.has(id)) map.set(id, { id, name, products: [] });
      map.get(id)!.products.push(p);
    }
    return Array.from(map.values());
  })();

  function updateCartQuantity(idx: number, delta: number) {
    setCart((prev) =>
      prev
        .map((item, i) =>
          i === idx ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  const subtotal = cart.reduce(
    (s, item) =>
      s + itemUnitPrice(item.product, item.productOptions) * item.quantity,
    0
  );

  const totalQuantity = cart.reduce((s, item) => s + item.quantity, 0);

  async function handleSubmit() {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const items = cart.map((item, idx) => ({
        rank: idx,
        productId: item.product.id,
        quantity: item.quantity,
        price: itemUnitPrice(item.product, item.productOptions),
        originalPrice: Number(item.product.price),
        name: item.product.name,
        cost: Number(item.product.cost),
        productOptions: item.productOptions,
      }));

      const res = await fetch("/api/menu/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          discount: 0,
          isDining: true,
          tableName,
          userNote: userNote || undefined,
          source: "qrcode",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "送出失敗");
        return;
      }

      setOrdered(true);
      setCart([]);
      setCartOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    setCartOpen(false);
  }

  if (ordered) {
    return (
      <OrderSuccess
        tableName={tableName}
        onContinue={() => setOrdered(false)}
      />
    );
  }

  return (
    <div className="flex flex-col h-dvh bg-primary/5">
      {/* Table name (fixed) */}
      <div className="shrink-0 px-4 py-3 flex items-center justify-between">
        <p className="text-2xl font-semibold text-primary">{store?.name}</p>
        <Button size="lg" className="text-lg">
          桌號：{tableName}
        </Button>
      </div>

      {/* ScrollSpy (fills remaining space) */}
      <ScrollSpy
        orientation="vertical"
        defaultValue={groups[0]?.id ?? ""}
        offset={0}
        scrollContainer={scrollEl}
        className="flex-1 min-h-0 flex flex-col"
      >
        {/* Category nav (fixed) */}
        <ScrollSpyNav
          style={{ height: NAV_HEIGHT }}
          className="shrink-0 z-10 bg-background overflow-x-auto flex-nowrap items-center px-2 shadow-sm"
        >
          {groups.map((g) => (
            <ScrollSpyLink
              key={g.id}
              value={g.id}
              className="whitespace-nowrap text-xl shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {g.name}
            </ScrollSpyLink>
          ))}
        </ScrollSpyNav>

        {/* Scrollable product list */}
        <div ref={setScrollEl} className="flex-1 overflow-y-auto min-h-0 pb-16">
          <ScrollSpyViewport className="gap-0">
            {groups.map((g) => (
              <ScrollSpySection key={g.id} value={g.id} className="py-2">
                {/* Category header */}
                <div className="px-2">
                  <span className="inline-block text-xl font-bold text-primary px-2 py-0.5 w-full">
                    {g.name}
                  </span>
                </div>

                {/* Product rows */}
                <div className="flex flex-col gap-4 px-2">
                  {g.products.map((product) => (
                    <Card
                      key={product.id}
                      className="ring-0 cursor-pointer"
                      onClick={() => setConfigProduct(product)}
                    >
                      <CardContent className="flex gap-3">
                        {/* Image (LEFT) */}
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                          {product.imageUrls?.[0] ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={product.imageUrls[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : null}
                        </div>

                        {/* Text info (RIGHT) */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xl">{product.name}</p>
                          <p className="text-lg mt-1 text-primary font-semibold">
                            ${Number(product.price)}
                          </p>
                          {product.description && (
                            <p className="text-lg text-muted-foreground mt-1 line-clamp-2 whitespace-pre-line">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollSpySection>
            ))}
          </ScrollSpyViewport>
        </div>
      </ScrollSpy>

      {/* Bottom cart bar */}
      <div className="px-4 py-2.5">
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="w-full rounded-xl bg-primary text-primary-foreground py-3.5 font-semibold text-base"
        >
          {`查看購物車(${totalQuantity}) $${subtotal}`}
        </button>
      </div>

      {/* Cart dialog */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="w-full h-full max-w-none max-h-none rounded-none flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl ">購物車</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 space-y-1">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-10 text-lg">
                尚無商品
              </p>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 py-3 border-b last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xl">{item.product.name}</p>
                    {item.productOptions.length > 0 && (
                      <div className="text-base text-muted-foreground mt-0.5">
                        {item.productOptions.map((o) => (
                          <p key={o.name}>
                            {o.productTypeName}：{o.name}
                            {o.price > 0 && ` +$${o.price}`}
                          </p>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateCartQuantity(idx, -1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-base font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateCartQuantity(idx, 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <span className="text-lg font-semibold shrink-0">
                    $
                    {itemUnitPrice(item.product, item.productOptions) *
                      item.quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() =>
                      setCart((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="space-y-3 pt-3 border-t">
              <Textarea
                placeholder="備註（例：不加冰、少糖）"
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                rows={2}
                className="text-base resize-none"
              />
              <div className="flex justify-between font-bold text-2xl">
                <span>合計</span>
                <span>${subtotal}</span>
              </div>

              <div className="flex flex-row gap-2">
                <Button
                  size="xl"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancel}
                >
                  繼續選購
                </Button>
                <Button
                  size="xl"
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "送出中..." : "送出訂單"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product option dialog */}
      <ProductOptionDialog
        product={configProduct}
        onConfirm={(options, qty) => {
          if (configProduct)
            setCart((prev) => [
              ...prev,
              {
                product: configProduct,
                quantity: qty,
                productOptions: options,
              },
            ]);
          setConfigProduct(null);
        }}
        onClose={() => setConfigProduct(null)}
      />
    </div>
  );
}
