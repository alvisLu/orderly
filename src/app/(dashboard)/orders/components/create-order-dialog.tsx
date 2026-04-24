"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Trash2,
  ShoppingCart,
  Settings2,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
} from "lucide-react";
import { toast } from "sonner";
import { apiGetProducts } from "@/app/api/products/api";
import { apiCreateOrder } from "@/app/api/orders/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Scroller } from "@/components/ui/scroller";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/modules/products/types";
import type {
  Order,
  LineItemOption,
  CreateOrderInput,
} from "@/modules/orders/types";
import {
  ProductConfigSheet,
  type ProductConfigResult,
} from "./product-config-sheet";
import { Calculator } from "@/components/shared/calculator";
import Big from "big.js";
import { Payment } from "@/generated/prisma/client";
import { apiGetPayments } from "@/app/api/payments/api";
interface CalcDiscountProps {
  subtotal: number;
  setDiscount: (discount: number) => void;
}

type DiscountType = "fixedAmount" | "percentage";

const DISCOUNT_TYPE: Record<DiscountType, string> = {
  fixedAmount: "固定折扣",
  percentage: "百分比折扣",
};

function CalcDiscount({ subtotal, setDiscount }: CalcDiscountProps) {
  const [discountPrice, setDiscountPrice] = useState(0);
  const [open, setOpen] = useState(false);
  const [calcType, setCalcType] = useState<"fixedAmount" | "percentage">(
    "fixedAmount"
  );

  function handleCalcChange(val: string) {
    setDiscountPrice(Number(val));
  }

  function handleConfirm() {
    setDiscount(
      calcType === "fixedAmount"
        ? discountPrice
        : Big(discountPrice).div(100).times(subtotal).toNumber()
    );

    setDiscountPrice(0);
    setCalcType("fixedAmount");
    setOpen(false);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">折扣</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>折扣設定</DialogTitle>
          <DialogDescription>
            <div className="flex gap-2 mb-2">
              {(Object.keys(DISCOUNT_TYPE) as DiscountType[]).map((type) => (
                <Button
                  key={type}
                  size="xl"
                  variant={calcType === type ? "default" : "outline"}
                  onClick={() => {
                    setCalcType(type);
                  }}
                >
                  {DISCOUNT_TYPE[type]}
                </Button>
              ))}
            </div>
            <Calculator
              defaultValue={discountPrice.toString()}
              onChange={handleCalcChange}
              onConfirm={handleConfirm}
            />
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
interface CheckoutProps {
  className?: string;
  disabled?: boolean;
  buildPayload: (opts?: {
    selectedPayment?: Payment | null;
    fulfillmentStatus?: "fulfilled";
  }) => CreateOrderInput;
  total: number;
  onCreated?: (order: Order) => void;
  onClose: () => void;
}

function Checkout({
  className,
  disabled,
  buildPayload,
  total,
  onCreated,
  onClose,
}: CheckoutProps) {
  const [open, setOpen] = useState(false);
  const [calcValue, setCalcValue] = useState(total.toString());
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    apiGetPayments().then((r) => {
      setPayments(r);
      setSelectedPayment(r.length > 0 ? r[0] : null);
    });
  }, [open, total]);

  const change = Big(calcValue).minus(total).toNumber();

  async function handlePay() {
    if (!selectedPayment) return;
    setIsSubmitting(true);
    try {
      const order = await apiCreateOrder(buildPayload({ selectedPayment }));
      toast.success("訂單已建立");
      setOpen(false);
      onCreated?.(order);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePayAndFulfill() {
    if (!selectedPayment) return;
    setIsSubmitting(true);
    try {
      const order = await apiCreateOrder(
        buildPayload({ selectedPayment, fulfillmentStatus: "fulfilled" })
      );
      toast.success("訂單已建立並出餐");
      setOpen(false);
      onCreated?.(order);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="xl" className={className} disabled={disabled}>
          立即結帳
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>付款方式</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <div className="flex space-y-1 justify-between font-semibold text-2xl">
            <div className="flex ">
              <span>總額: </span>
              <span>${Number(total) || 0}</span>
            </div>
            <div className="flex justify-end gap-2 text-2xl text-muted-foreground font-semibold">
              <span>找零:</span>
              <span>${change > 0 ? change : 0}</span>
            </div>
          </div>
          <div className="flex gap-4">
            {/* Payment selection */}
            <div className="flex flex-col flex-wrap w-[50%] gap-2">
              {payments.map((p) => (
                <Button
                  key={p.id}
                  size="xl"
                  variant={selectedPayment?.id === p.id ? "default" : "outline"}
                  onClick={() => setSelectedPayment(p)}
                >
                  {p.name}
                </Button>
              ))}
            </div>

            {/* Calculator */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Short keys */}
              <div className="flex flex-col justify-between gap-2">
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="xl"
                    onClick={() => setCalcValue(`100`)}
                  >
                    $100
                  </Button>
                  <Button
                    variant="outline"
                    size="xl"
                    onClick={() => setCalcValue(`200`)}
                  >
                    $200
                  </Button>
                  <Button
                    variant="outline"
                    size="xl"
                    onClick={() => setCalcValue(`500`)}
                  >
                    $500
                  </Button>
                  <Button
                    variant="outline"
                    size="xl"
                    onClick={() => setCalcValue(`1000`)}
                  >
                    $1000
                  </Button>
                </div>
              </div>
              <Calculator
                value={calcValue}
                onChange={setCalcValue}
                disableMonitor={false}
                disableAction={true}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="xl"
              variant="destructive"
              onClick={handlePay}
              disabled={isSubmitting || !selectedPayment}
            >
              付款
            </Button>
            <Button
              size="xl"
              onClick={handlePayAndFulfill}
              disabled={isSubmitting || !selectedPayment}
            >
              結清出貨
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CartItem {
  product: Product;
  quantity: number;
  price: number;
  productOptions: LineItemOption[];
}
interface Props {
  onCreated?: (order: Order) => void;
  trigger?: React.ReactNode;
}

export function CreateOrderDialog({ onCreated, trigger }: Props) {
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [note, setNote] = useState("");
  const [configProduct, setConfigProduct] = useState<Product | null>(null);
  const [editingCartIndex, setEditingCartIndex] = useState<number | null>(null);
  const [configResetKey, setConfigResetKey] = useState(0);
  const [configInitialValues, setConfigInitialValues] = useState<
    import("./product-config-sheet").ProductConfigResult | null
  >(null);

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
      setIsDining(true);
      setSearch("");
      setCategoryId(null);
      setIsSubmitting(false);
      setNote("");
    }
  }

  function handleProductClick(product: Product) {
    if (product.productTypes.length > 0) {
      setConfigProduct(product);
    } else {
      addToCart(product, 1, Number(product.price), []);
    }
  }

  function addToCart(
    product: Product,
    quantity: number,
    price: number,
    productOptions: LineItemOption[]
  ) {
    setCart((prev) => {
      return [...prev, { product, quantity, price, productOptions }];
    });
  }

  function handleCartItemEdit(index: number) {
    const item = cart[index];
    const selectedOptions: import("./product-config-sheet").SelectedOptions =
      {};
    for (const { productType } of item.product.productTypes) {
      const items =
        productType.items as unknown as import("@/modules/product-types/types").ProductTypeItem[];
      const chosen = item.productOptions
        .filter((o) => o.productTypeName === productType.name)
        .map((o) => items.find((i) => i.name === o.name))
        .filter((i): i is NonNullable<typeof i> => i !== undefined);
      if (chosen.length) selectedOptions[productType.id] = chosen;
    }
    setEditingCartIndex(index);
    setConfigProduct(item.product);
    setConfigResetKey((k) => k + 1);
    // store initialValues via a ref-like pattern using state
    setConfigInitialValues({
      quantity: item.quantity,
      price: item.price,
      selectedOptions,
    });
  }

  function handleConfigConfirm(result: ProductConfigResult) {
    if (!configProduct) return;
    const typeNameMap = Object.fromEntries(
      configProduct.productTypes.map(({ productType }) => [
        productType.id,
        productType.name,
      ])
    );
    const options: LineItemOption[] = Object.entries(
      result.selectedOptions
    ).flatMap(([typeId, items]) =>
      items.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: 1,
        productTypeName: typeNameMap[typeId] ?? "",
      }))
    );
    if (editingCartIndex !== null) {
      setCart((prev) =>
        prev.map((item, i) =>
          i === editingCartIndex
            ? {
                ...item,
                quantity: result.quantity,
                price: result.price,
                productOptions: options,
              }
            : item
        )
      );
    } else {
      addToCart(configProduct, result.quantity, result.price, options);
    }
    setConfigProduct(null);
    setEditingCartIndex(null);
    setConfigInitialValues(null);
  }

  function removeCartItem(idx: number) {
    setCart((prev) => [...prev.slice(0, idx), ...prev.slice(idx + 1)]);
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

  const subtotal = cart
    .reduce((sum, item) => {
      const optionsTotal = item.productOptions.reduce(
        (s, o) => s.plus(Big(o.price).times(o.quantity)),
        Big(0)
      );
      return sum.plus(Big(item.price).times(item.quantity)).plus(optionsTotal);
    }, Big(0))
    .toNumber();

  const total = Big(subtotal).minus(discount).toNumber();

  function buildOrderPayload(opts?: {
    selectedPayment?: Payment | null;
    fulfillmentStatus?: "fulfilled";
  }): CreateOrderInput {
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
    const gateway = opts?.selectedPayment
      ? { id: opts.selectedPayment.id, name: opts.selectedPayment.name }
      : undefined;
    return {
      items,
      discount,
      isDining,
      note: note || undefined,
      source: "store",
      gateway,
      financialStatus: opts?.selectedPayment ? "paid" : undefined,
      fulfillmentStatus: opts?.fulfillmentStatus,
    };
  }

  async function handleClose() {
    handleOpen(false);
  }

  async function handleSubmit() {
    if (cart.length === 0) {
      toast.error("請先加入商品");
      return;
    }
    setIsSubmitting(true);
    const order = await apiCreateOrder(buildOrderPayload());
    toast.success("訂單已建立");
    handleOpen(false);
    onCreated?.(order);
    setIsSubmitting(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogTrigger asChild>
          {trigger ?? <Button>新增訂單</Button>}
        </DialogTrigger>
        <DialogContent
          className="!w-full !h-full !max-w-none !max-h-none p-0 gap-0 overflow-hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <div className="flex h-full overflow-hidden">
            {/* Cart */}
            <div className="w-95 min-h-0 flex flex-col overflow-hidden border-r">
              <div className="flex items-center gap-2 px-4 py-3 border-b">
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
              <Scroller className="flex-1 px-4 py-3 space-y-3">
                {cart.length === 0 ? (
                  <p className="text-base text-muted-foreground text-center py-8">
                    點擊商品加入購物車
                  </p>
                ) : (
                  cart.map((item, idx) => (
                    <div key={item.product.id} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="flex-1 min-w-0  text-left bg-accent rounded transition-colors px-2"
                          onClick={() => handleCartItemEdit(cart.indexOf(item))}
                        >
                          <div className="flex items-center justify-between px-1 py-2">
                            <div className="flex flex-col gap-1 min-w-0">
                              <p className="text-xl font-medium line-clamp-1">
                                {item.product.name}
                              </p>
                              {item.productOptions.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {item.productOptions.map((option, i) => (
                                    <Badge key={i} variant="secondary">
                                      {`${option.name} ${option.price > 0 ? `+${option.price}` : ""}`}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-center justify-between shrink-0 text-base">
                              <span className="text-muted-foreground">
                                {`×${item.quantity}`}
                              </span>
                              <span className="font-semibold">
                                ${item.price * item.quantity}
                              </span>
                            </div>
                          </div>
                        </button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeCartItem(idx)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </Scroller>

              {/* Summary */}
              <div className="border-t px-4 py-4 space-y-3">
                <div className="flex justify-between text-base">
                  <Button size="lg" variant="outline">
                    小計
                  </Button>
                  <span>${subtotal}</span>
                </div>

                <div className="flex justify-between text-base">
                  <CalcDiscount subtotal={subtotal} setDiscount={setDiscount} />
                  <span>${discount}</span>
                </div>
                <Separator />

                <div className="flex justify-between font-semibold">
                  <span className="text-lg">總額</span>
                  <span className="text-lg">${total}</span>
                </div>

                <Scroller
                  asChild
                  className="h-24 resize-none text-base bg-muted placeholder:text-muted-foreground"
                >
                  <Textarea
                    placeholder="店內備註..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </Scroller>
                <div className="grid grid-cols-5 gap-2">
                  <Button
                    size="xl"
                    className="col-span-1"
                    variant="outline"
                    onClick={handleClose}
                  >
                    取消
                  </Button>
                  <Checkout
                    className="col-span-2"
                    disabled={cart.length === 0}
                    buildPayload={buildOrderPayload}
                    total={total}
                    onCreated={onCreated}
                    onClose={handleClose}
                  />
                  <Button
                    size="xl"
                    className="col-span-2"
                    onClick={handleSubmit}
                    disabled={isSubmitting || cart.length === 0}
                  >
                    {isSubmitting ? "建立中..." : "稍後結帳"}
                  </Button>
                </div>
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

                {/* Settings */}
                <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon-xl">
                      <Settings2 />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogTitle>設定</DialogTitle>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">欄位設定</p>
                        <div className="flex gap-2">
                          {[3, 4, 5, 6].map((n) => (
                            <Button
                              key={n}
                              size="sm"
                              variant={cols === n ? "default" : "outline"}
                              onClick={() => setCols(n)}
                            >
                              {n} 欄
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
              <Scroller className="flex-1 p-4">
                <div
                  className={`grid gap-3 ${{ 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6" }[cols]}`}
                >
                  {filtered.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleProductClick(product)}
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
              </Scroller>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ProductConfigSheet
        product={configProduct}
        onConfirm={handleConfigConfirm}
        onClose={() => {
          setConfigProduct(null);
          setEditingCartIndex(null);
          setConfigInitialValues(null);
        }}
        initialValues={configInitialValues ?? undefined}
        resetKey={configResetKey}
      />
    </>
  );
}
