"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { ChevronDown, Lock, User, Store, Info } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Order, LineItemOption } from "@/modules/orders/types";
import {
  OrderStatusBadge,
  FulfillmentStatusBadge,
  FinancialStatusBadge,
} from "./order-status-badge";
import {
  apiGetOrder,
  apiUpdateOrder,
  apiDeleteOrder,
} from "@/app/api/orders/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (order: Order) => void;
  onDeleted?: (id: string) => void;
}

export function OrderDetailSheet({
  orderId,
  open,
  onOpenChange,
  onUpdated,
  onDeleted,
}: Props) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userNote, setUserNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [internalNote, setInternalNote] = useState("");
  const [isSavingInternalNote, setIsSavingInternalNote] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      return;
    }
    setOrder(null);
    setIsLoadingOrder(true);
    apiGetOrder(orderId)
      .then((o) => {
        setOrder(o);
        setUserNote(o.userNote ?? "");
        setInternalNote(o.note ?? "");
      })
      .finally(() => setIsLoadingOrder(false));
  }, [orderId]);

  async function refreshOrder() {
    if (!order) return;
    setIsLoadingOrder(true);
    const o = await apiGetOrder(order.id);
    setOrder(o);
    setUserNote(o.userNote ?? "");
    setInternalNote(o.note ?? "");
    setIsLoadingOrder(false);
  }

  async function handleFulfillment(
    status: "pending" | "fulfilled" | "returned"
  ) {
    if (!order) return;
    setIsUpdating(true);
    const updated = await apiUpdateOrder(order.id, {
      fulfillmentStatus: status,
    });
    onUpdated?.(updated);
    toast.success("出餐狀態已更新");
    setIsUpdating(false);
    await refreshOrder();
  }

  async function handleFinancial(status: "paid" | "refunded" | "pending") {
    if (!order) return;
    setIsUpdating(true);
    try {
      const updated = await apiUpdateOrder(order.id, {
        financialStatus: status,
      });
      onUpdated?.(updated);
      toast.success("付款狀態已更新");
    } catch {
      toast.error("更新失敗");
    } finally {
      setIsUpdating(false);
      await refreshOrder();
    }
  }

  async function handleDelete() {
    if (!order) return;
    if (!confirm("確定要刪除此訂單？")) return;
    setIsDeleting(true);
    try {
      await apiDeleteOrder(order.id);
      onDeleted?.(order.id);
      onOpenChange(false);
      toast.success("訂單已刪除");
    } catch {
      toast.error("刪除失敗");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSaveInternalNote() {
    if (!order) return;
    setIsSavingInternalNote(true);
    try {
      const updated = await apiUpdateOrder(order.id, { note: internalNote });
      onUpdated?.(updated);
      toast.success("店內備註已儲存");
    } catch {
      toast.error("儲存失敗");
    } finally {
      setIsSavingInternalNote(false);
    }
  }

  async function handleSaveNote() {
    if (!order) return;
    setIsSavingNote(true);
    try {
      const updated = await apiUpdateOrder(order.id, { userNote });
      onUpdated?.(updated);
      toast.success("備註已儲存");
    } catch {
      toast.error("儲存失敗");
    } finally {
      setIsSavingNote(false);
    }
  }

  if (!order) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="!w-[90vw] !h-[90vh] !max-w-none !max-h-none p-0 gap-0 overflow-hidden">
          <div className="flex h-full items-center justify-center">
            {isLoadingOrder ? (
              <Spinner className="size-18 text-muted-foreground" />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const subtotal = order.lineItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[90vw] !h-[90vh] !max-w-none !max-h-none p-0 gap-0 overflow-hidden">
        <div className="flex h-full">
          {/* Left panel */}
          <div className="flex-1 flex flex-col overflow-hidden border-r">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b">
              <DialogTitle className="text-lg font-semibold">
                訂單內容
              </DialogTitle>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 px-6 py-3 items-center justify-between border-b">
              <div className="flex gap-2 items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" disabled={isUpdating}>
                      出貨狀態 <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleFulfillment("fulfilled")}
                    >
                      已出餐
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleFulfillment("returned")}
                    >
                      已退貨
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleFulfillment("pending")}
                    >
                      待出餐
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" disabled={isUpdating}>
                      付款狀態 <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleFinancial("paid")}>
                      付款
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleFinancial("refunded")}
                    >
                      退款
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleFinancial("pending")}
                    >
                      未付款
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex gap-2">
                <FinancialStatusBadge status={order.financialStatus} />
                <FulfillmentStatusBadge status={order.fulfillmentStatus} />
                <OrderStatusBadge status={order.status} />
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Order info card */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">訂單</span>
                  <span className="text-xs text-muted-foreground font-mono truncate max-w-xs">
                    {order.id}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                  {order.source && (
                    <Badge variant="outline">{order.source}</Badge>
                  )}
                  <Badge variant="outline">
                    {order.isDining ? "用餐中" : "已離場"}
                  </Badge>
                  <span>
                    {dayjs(order.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                  </span>
                </div>

                {/* Line items */}
                <div className="space-y-4 pt-1">
                  {order.lineItems
                    .slice()
                    .sort((a, b) => a.rank - b.rank)
                    .map((item) => {
                      const options =
                        item.itemOptions as unknown as LineItemOption[];
                      const itemTotal = Number(item.price) * item.quantity;
                      return (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-14 h-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            {item.product?.imageUrls?.[0] ? (
                              <Image
                                src={item.product.imageUrls[0]}
                                alt={item.product.name}
                                width={56}
                                height={56}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-blue-600">
                              {item.name}
                            </p>
                            {options.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {options.map((opt, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-xs font-normal"
                                  >
                                    {opt.name}
                                    {opt.price > 0 ? ` $${opt.price}` : ""}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right text-sm space-y-1 flex-shrink-0">
                            <div className="flex flex-row items-center justify-end gap-1">
                              <p className="text-muted-foreground">
                                {item.quantity} ×
                              </p>
                              {item.originalPrice !== item.price ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="text-muted-foreground underline">
                                      ${Number(item.price)}{" "}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>原價 ${Number(item.originalPrice)}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <p className="text-muted-foreground">
                                  ${Number(item.price)}
                                </p>
                              )}
                            </div>
                            <p className="font-medium">$ {itemTotal}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">小計</span>
                    <span>$ {subtotal}</span>
                  </div>
                  {Number(order.discount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">折扣</span>
                      <span>-${Number(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold">
                    <span>總額</span>
                    <span>$ {Number(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Transaction records */}
              <div className="border rounded-lg p-4">
                <p className="text-sm font-medium mb-3">交易記錄</p>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${Number(order.total)}</span>
                  <span>
                    {order.financialStatus === "paid" ? "現金" : "未付款"}{" "}
                    {dayjs(order.updatedAt).format("YYYY-MM-DD HH:mm")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="w-72 flex flex-col overflow-y-auto">
            {/* 店面 */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Store className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">店面</span>
              </div>
            </div>

            {/* 顧客資訊 */}
            <div className="p-4 border-b">
              <p className="text-sm font-medium mb-3">顧客資訊</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                {order.userPhone && (
                  <span className="text-sm">{order.userPhone}</span>
                )}
              </div>
            </div>

            {/* 客人備註 */}
            <div className="p-4 border-b">
              <p className="text-sm font-medium mb-2">客人備註</p>
              <Textarea
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                onBlur={handleSaveNote}
                disabled={isSavingNote}
                placeholder="新增客人備註..."
                className="text-sm resize-none h-40"
                rows={3}
              />
            </div>

            {/* 店內備註 */}
            <div className="p-4 border-b bg-amber-50">
              <div className="flex items-center gap-1.5 mb-2">
                <Lock className="h-3.5 w-3.5 text-amber-600" />
                <p className="text-sm font-medium text-amber-800">店內備註</p>
              </div>
              <Textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                onBlur={handleSaveInternalNote}
                disabled={isSavingInternalNote}
                placeholder="新增店內備註..."
                className="h-40 text-sm resize-none bg-amber-50 border-amber-200 placeholder:text-amber-400"
                rows={3}
              />
            </div>

            {/* Delete */}
            <div className="mt-auto p-4">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "刪除中..." : "刪除"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
