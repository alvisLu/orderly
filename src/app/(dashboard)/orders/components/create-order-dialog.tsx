"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  LayoutGrid,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
} from "lucide-react";
import { toast } from "sonner";
import { apiGetProducts } from "@/app/api/products/api";
import { apiCreateOrder } from "@/app/api/orders/api";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/modules/products/types";
import type { Order } from "@/modules/orders/types";

interface CartItem {
  product: Product;
  quantity: number;
}

interface Props {
  onCreated: (order: Order) => void;
}

export function CreateOrderDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [isDining, setIsDining] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cols, setCols] = useState(3);
  const [sortAsc, setSortAsc] = useState(true);
  const [note, setNote] = useState("");
  const [userNote, setUserNote] = useState("");

  useEffect(() => {
    if (!open) return;
    apiGetProducts({ limit: 100, page: 1 }).then((r) => setProducts(r.data));
  }, [open]);

  const categories = Array.from(
    new Map(
      products
        .map((p) => p.category)
        .filter((c): c is NonNullable<typeof c> => c !== null)
        .map((c) => [c.id, c])
    ).values()
  );

  function handleOpen(v: boolean) {
    setOpen(v);
    if (!v) {
      setCart([]);
      setDiscount(0);
      setIsDining(false);
      setSearch("");
      setCategoryId(null);
    }
  }

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function updateQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: i.quantity + delta }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }

  const filtered = products
    .filter((p) => {
      const matchCategory =
        !categoryId ||
        (categoryId === "__uncategorized__"
          ? !p.category
          : p.category?.id === categoryId);
      const matchSearch =
        !search || p.name.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    })
    .sort((a, b) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );

  const subtotal = cart.reduce(
    (s, i) => s + Number(i.product.price) * i.quantity,
    0
  );
  const total = Math.max(0, subtotal - discount);

  async function handleSubmit() {
    if (cart.length === 0) {
      toast.error("請先加入商品");
      return;
    }
    setIsSubmitting(true);
    try {
      const order = await apiCreateOrder({
        items: cart.map((item, idx) => ({
          rank: idx,
          productId: item.product.id,
          quantity: item.quantity,
          price: Number(item.product.price),
          productOptions: [],
        })),
        discount,
        isDining,
        note: note || undefined,
        userNote: userNote || undefined,
      });
      toast.success("訂單已建立");
      handleOpen(false);
      onCreated(order);
    } catch {
      toast.error("建立訂單失敗");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button>新增訂單</Button>
      </DialogTrigger>
      <DialogContent className="!w-full !h-full !max-w-none !max-h-none p-0 gap-0 overflow-hidden">
        <div className="flex h-full overflow-hidden">
          {/* Cart */}
          <div className="w-80 min-h-0 flex flex-col overflow-hidden border-r">
            <div className="flex items-center gap-2 px-4 py-4 border-b">
              <ShoppingCart />
              <span className="font-semibold text-base">共</span>
              {cart.length > 0 && (
                <Badge variant="secondary">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </Badge>
              )}
              <span className="font-semibold text-base">項</span>

              <Button size="xl" className="ml-auto">
                <Trash2 /> 清空
              </Button>
            </div>
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {cart.length === 0 ? (
                <p className="text-base text-muted-foreground text-center py-8">
                  點擊商品加入購物車
                </p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xl font-medium line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-base text-muted-foreground">
                        ${Number(item.product.price)} × {item.quantity} = $
                        {Number(item.product.price) * item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQty(item.product.id, -1)}
                      >
                        {item.quantity === 1 ? <Trash2 /> : <Minus />}
                      </Button>
                      <span className="w-6 text-center text-base">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQty(item.product.id, 1)}
                      >
                        <Plus />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Summary */}
            <div className="border-t px-4 py-4 space-y-3">
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">小計</span>
                <span>${subtotal}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-base text-muted-foreground flex-1">
                  折扣
                </span>
                <Input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="h-7 w-24 text-right"
                />
              </div>

              <Separator />

              <div className="flex justify-between font-semibold">
                <span className="text-base">總額</span>
                <span>${total}</span>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-base">用餐中</Label>
                <Switch checked={isDining} onCheckedChange={setIsDining} />
              </div>

              <Tabs defaultValue="note">
                <TabsList>
                  <TabsTrigger value="note">內部備註</TabsTrigger>
                  <TabsTrigger value="userNote">客戶備註</TabsTrigger>
                </TabsList>
                <TabsContent value="note">
                  <Textarea
                    placeholder="內部備註..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="resize-none text-base"
                    rows={3}
                  />
                </TabsContent>
                <TabsContent value="userNote">
                  <Textarea
                    placeholder="客戶備註..."
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    className="resize-none text-base"
                    rows={3}
                  />
                </TabsContent>
              </Tabs>

              <Button
                size="xl"
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting || cart.length === 0}
              >
                {isSubmitting ? "建立中..." : "建立訂單"}
              </Button>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-3 border-b">
              <DialogTitle className="text-lg font-semibold">
                新增訂單
              </DialogTitle>
              <Input
                size="lg"
                placeholder="搜尋商品..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
              <Button size="xl" onClick={() => setSortAsc((v) => !v)}>
                名稱排序
                {sortAsc ? (
                  <ArrowDownNarrowWide className="h-4 w-4" />
                ) : (
                  <ArrowUpNarrowWide className="h-4 w-4" />
                )}
              </Button>
              <div className="ml-auto flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      {cols} 欄
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {[3, 4, 5, 6].map((n) => (
                      <DropdownMenuItem key={n} onClick={() => setCols(n)}>
                        {n} 欄
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 px-6 py-2 border-b overflow-x-auto">
              <Button
                size="xl"
                variant={categoryId === null ? "default" : "outline"}
                onClick={() => setCategoryId(null)}
              >
                全部
              </Button>
              {categories.map((c) => (
                <Button
                  key={c.id}
                  size="xl"
                  variant={categoryId === c.id ? "default" : "outline"}
                  onClick={() => setCategoryId(c.id)}
                >
                  {c.name}
                </Button>
              ))}
              {products.some((p) => !p.category) && (
                <Button
                  size="xl"
                  variant={
                    categoryId === "__uncategorized__" ? "default" : "outline"
                  }
                  onClick={() => setCategoryId("__uncategorized__")}
                >
                  未分類
                </Button>
              )}
            </div>

            {/* Product grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div
                className={`grid gap-3 ${{ 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6" }[cols]}`}
              >
                {filtered.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addToCart(product)}
                    className="rounded-lg border bg-card hover:bg-accent transition-colors overflow-hidden"
                  >
                    <div className="relative w-full aspect-video bg-muted">
                      {product.imageUrls?.[0] ? (
                        <Image
                          src={product.imageUrls[0]}
                          alt={product.name}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted" />
                      )}
                      <span className="absolute top-1.5 right-1.5 rounded-full bg-black/60 px-2 py-0.5 text-lg font-medium text-white">
                        ${Number(product.price)}
                      </span>
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-2 py-0.5 text-xl font-medium text-white line-clamp-1 max-w-[94%]">
                        {product.name}
                      </span>
                    </div>
                  </button>
                ))}
                {Array.from({
                  length: (cols - (filtered.length % cols)) % cols,
                }).map((_, i) => (
                  <Skeleton
                    key={`skeleton-${i}`}
                    className="w-full aspect-video rounded-lg"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
