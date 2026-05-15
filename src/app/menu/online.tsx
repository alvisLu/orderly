"use client";

import { useState } from "react";
import Image from "next/image";
import Big from "big.js";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { OrderHistory } from "./components/order-history";
import { OrderSuccess } from "./components/order-success";
import { ProductOptionDialog } from "./components/product-option-dialog";
import { saveMyOrderId } from "./storage";

const NAV_HEIGHT = 60;
const UNCATEGORIZED_ID = "uncategorized";

interface CartItem {
  product: Product;
  quantity: number;
  price: number;
  productOptions: LineItemOption[];
}

interface CategoryGroup {
  id: string;
  name: string;
  products: Product[];
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
  const [viewOrders, setViewOrders] = useState(false);
  const [noteEditOpen, setNoteEditOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");

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

  const subtotal = cart
    .reduce((sum, item) => {
      const optionsPrice = item.productOptions.reduce(
        (s, o) => s.plus(o.price),
        Big(0)
      );
      return sum.plus(Big(item.price).plus(optionsPrice).times(item.quantity));
    }, Big(0))
    .toNumber();

  const totalQuantity = cart.reduce((s, item) => s + item.quantity, 0);

  async function handleSubmit() {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const items = cart.map((item, idx) => ({
        rank: idx,
        productId: item.product.id,
        quantity: item.quantity,
        price: item.price,
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

      const order = await res.json();
      saveMyOrderId(order.id);
      setOrdered(true);
      setCart([]);
      setUserNote("");
      setCartOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    setCartOpen(false);
  }

  if (viewOrders) {
    return <OrderHistory onBack={() => setViewOrders(false)} />;
  }

  if (ordered) {
    return (
      <OrderSuccess
        tableName={tableName}
        onContinue={() => setOrdered(false)}
        onViewOrders={() => {
          setOrdered(false);
          setViewOrders(true);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-dvh bg-primary/5">
      {/* Table name (fixed) */}
      <div className="shrink-0 px-4 py-3 flex items-center justify-between">
        <p className="text-2xl font-semibold text-primary">{store?.name}</p>
        <div className="flex items-center gap-2">
          <Button>桌號：{tableName}</Button>
          <Button variant="secondary" onClick={() => setViewOrders(true)}>
            查看訂單
          </Button>
        </div>
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
        <Button
          size="2xl"
          onClick={() => setCartOpen(true)}
          disabled={cart.length <= 0}
          className="w-full"
        >
          {`查看購物車(${totalQuantity}) $${subtotal}`}
        </Button>
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
              cart.map((item, idx) => {
                const optionsPrice = item.productOptions.reduce(
                  (s, o) => s + o.price,
                  0
                );
                const unitPrice = item.price + optionsPrice;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 py-3 border-b last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xl">{item.product.name}</p>
                      {item.productOptions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.productOptions.map((o) => (
                            <Badge key={o.name} variant="secondary">
                              {o.name}
                              {o.price > 0 && ` +$${o.price}`}
                            </Badge>
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
                      ${unitPrice * item.quantity}
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
                );
              })
            )}
          </div>

          <div className="space-y-3 pt-3 border-t">
            <div
              className="cursor-pointer"
              onClick={() => {
                setNoteDraft(userNote);
                setNoteEditOpen(true);
              }}
            >
              <Textarea
                readOnly
                tabIndex={-1}
                inputMode="none"
                placeholder="備註（例：不加冰、少糖）"
                value={userNote}
                rows={3}
                className="text-base resize-none"
              />
            </div>
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
                disabled={isSubmitting || cart.length <= 0}
              >
                {isSubmitting ? "送出中..." : "送出訂單"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note edit dialog */}
      <Dialog open={noteEditOpen} onOpenChange={setNoteEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">備註</DialogTitle>
          </DialogHeader>
          <Textarea
            autoFocus
            placeholder="例：不加冰、少糖"
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            rows={4}
            className="text-base resize-none"
          />
          <div className="flex flex-row gap-2">
            <Button
              size="xl"
              variant="outline"
              className="flex-1"
              onClick={() => setNoteEditOpen(false)}
            >
              取消
            </Button>
            <Button
              size="xl"
              className="flex-1"
              onClick={() => {
                setUserNote(noteDraft);
                setNoteEditOpen(false);
              }}
            >
              確認
            </Button>
          </div>
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
                price: Number(configProduct.price),
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
