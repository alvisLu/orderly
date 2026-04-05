"use client";

import { useState } from "react";
import dayjs from "dayjs";
import {
  Printer,
  Pencil,
  Utensils,
  CircleDollarSign,
  Trash2,
  Truck,
  BookmarkX,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { apiUpdateOrder, apiDeleteOrder } from "@/app/api/orders/api";
import { CheckoutDialog } from "@/app/(dashboard)/orders/components/checkout-dialog";
import type { Order, LineItemOption } from "@/modules/orders/types";
import {
  OrderStatus,
  OrderFinancialStatus,
  OrderFulfillmentStatus,
} from "@/generated/prisma/client";

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "待處理", variant: "outline" },
  processing: { label: "處理中", variant: "default" },
  done: { label: "完成", variant: "secondary" },
  cancelled: { label: "已取消", variant: "destructive" },
};

const HEADER_BG: Record<OrderStatus, string> = {
  pending: "bg-accent",
  processing: "bg-primary",
  done: "bg-secondary",
  cancelled: "bg-destructive",
};

const HEADER_TEXT: Record<OrderStatus, string> = {
  pending: "text-muted-foreground",
  processing: "text-primary-foreground",
  done: "text-secondary-foreground",
  cancelled: "text-destructive-foreground",
};

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "待處理",
  processing: "處理中",
  done: "完成",
  cancelled: "已取消",
};

const ORDER_STATUS_VARIANT: Record<
  OrderStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  processing: "default",
  done: "secondary",
  cancelled: "destructive",
};

const FINANCIAL_LABEL: Record<OrderFinancialStatus, string> = {
  pending: "未付",
  paid: "結清",
  refunded: "退款",
};

const FINANCIAL_VARIANT: Record<
  OrderFinancialStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  paid: "secondary",
  refunded: "destructive",
};

const FULFILLMENT_LABEL: Record<OrderFulfillmentStatus, string> = {
  pending: "待出",
  fulfilled: "已出",
  returned: "退貨",
};

const FULFILLMENT_VARIANT: Record<
  OrderFulfillmentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  fulfilled: "secondary",
  returned: "destructive",
};

type Transaction = {
  type: string;
  amount: number;
  gateway: { name: string };
};

function TransactionList({ transactions }: { transactions: unknown }) {
  const txns = (transactions as Transaction[] | null) ?? [];
  if (txns.length === 0) return null;
  return (
    <div className="space-y-1 pt-2">
      {txns.map((tx, i) => (
        <div
          key={i}
          className="flex items-center justify-between text-sm text-muted-foreground"
        >
          <span>
            {tx.type === "checkout" ? "付款" : "退款"} - {tx.gateway.name}
          </span>
          <span>${tx.amount}</span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  order: Order;
  onUpdated: (order: Order) => void;
  onDeleted: (id: string) => void;
}

export function OrderCard({ order, onUpdated, onDeleted }: Props) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [voidOpen, setVoidOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  async function handleAccept() {
    setIsAccepting(true);
    try {
      const updated = await apiUpdateOrder(order.id, { status: "processing" });
      onUpdated(updated);
      toast.success("已接單");
    } catch {
      toast.error("接單失敗");
    } finally {
      setIsAccepting(false);
    }
  }

  async function handleFulfill() {
    try {
      const updated = await apiUpdateOrder(order.id, {
        fulfillmentStatus: "fulfilled",
      });
      onUpdated(updated);
      toast.success("已出餐");
    } catch {
      toast.error("出餐失敗");
    }
  }

  async function handleVoidConfirm() {
    setIsVoiding(true);
    const txns = (order.transactions as unknown as Transaction[] | null) ?? [];
    const checkoutTotal = txns
      .filter((t) => t.type === "checkout")
      .reduce((sum, t) => sum + t.amount, 0);
    try {
      const updated = await apiUpdateOrder(order.id, {
        status: "cancelled",
        fulfillmentStatus: "returned",
        financialStatus: "refunded",
        ...(checkoutTotal > 0 && {
          transaction: {
            type: "refund",
            amount: -checkoutTotal,
            gateway: { id: "", name: "作廢退款" },
          },
        }),
      });
      onUpdated(updated);
      setVoidOpen(false);
      toast.success("訂單已作廢");
    } catch {
      toast.error("作廢失敗");
    } finally {
      setIsVoiding(false);
    }
  }

  async function handleDeleteConfirm() {
    setIsDeleting(true);
    try {
      await apiDeleteOrder(order.id);
      onDeleted(order.id);
      setDeleteOpen(false);
      toast.success("訂單已刪除");
    } catch {
      toast.error("刪除失敗");
    } finally {
      setIsDeleting(false);
    }
  }

  const statusConfig = STATUS_CONFIG[order.status];
  const headerBg = HEADER_BG[order.status];
  const headerText = HEADER_TEXT[order.status];
  const created = dayjs(order.createdAt);
  const orderStatusVariant = ORDER_STATUS_VARIANT[order.status];
  const fulfillmentVariant = FULFILLMENT_VARIANT[order.fulfillmentStatus];
  const financialVariant = FINANCIAL_VARIANT[order.financialStatus];

  return (
    <>
      <div className="rounded-xl border-border overflow-hidden shadow-sm">
        {/* Header bar */}
        <div
          className={`${headerBg} ${headerText} px-4 py-2 flex items-center justify-between`}
        >
          <span className="font-semibold text-sm">
            {order.source === "qrcode" ? "QR" : "店面"}
          </span>
          <div>
            {order.status === "pending" ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleAccept}
                disabled={isAccepting}
              >
                {isAccepting ? "接單中..." : "接單"}
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setCheckoutOpen(true)}>
                    <CircleDollarSign className="h-4 w-4" />
                    結帳
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleFulfill}>
                    <Truck className="h-4 w-4" />
                    出餐
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setVoidOpen(true)}
                    className="text-destructive"
                  >
                    <BookmarkX className="h-4 w-4" />
                    作廢
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setDeleteOpen(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    刪除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-card text-card-foreground px-4 py-3 space-y-3">
          {/* Status & badges row */}
          <div className="flex items-center justify-between">
            <Button variant={orderStatusVariant} size="sm">
              {ORDER_STATUS_LABEL[order.status]}
            </Button>
            <div className="flex items-center gap-1.5">
              <Button variant={fulfillmentVariant} size="sm">
                <Utensils />
                {FULFILLMENT_LABEL[order.fulfillmentStatus]}
              </Button>
              <Button variant={financialVariant} size="sm">
                <CircleDollarSign />
                {FINANCIAL_LABEL[order.financialStatus]}
              </Button>
            </div>
          </div>

          {/* Info row: person count, date, print */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="border border-border rounded px-2 py-0.5 text-lg font-bold">
                {order.lineItems.reduce((s, i) => s + i.quantity, 0)}人
              </span>
              <span className="text-muted-foreground text-base">
                {created.format("MM/DD")}-{created.format("HH:mm")}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Printer className="h-5 w-5" />
            </Button>
          </div>

          {/* Line items */}
          <div className="border-t border-border pt-3 space-y-4">
            {order.lineItems
              .slice()
              .sort((a, b) => a.rank - b.rank)
              .map((item) => {
                const options = item.itemOptions as unknown as LineItemOption[];
                return (
                  <div key={item.id} className="space-y-1 border-b">
                    <div className="flex items-start ">
                      {/* Name */}
                      <span className="flex-1 text-lg font-medium leading-tight">
                        {item.name}
                      </span>
                      {/* Price & qty */}
                      <div className="text-right shrink-0 min-w-[65px]">
                        <div className="text-base font-semibold">
                          ${Number(item.price) * item.quantity}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity}/{item.quantity}
                        </div>
                      </div>
                    </div>

                    {/* Options as bordered badges */}
                    {options.length > 0 && (
                      <div className="flex flex-wrap gap-1 pb-3">
                        {options.map((opt, i) => (
                          <Badge key={i} variant="outline" size="sm">
                            {opt.name}${opt.price}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Transactions */}
          <TransactionList transactions={order.transactions} />

          {/* Footer: total & edit */}
          <div className="flex items-center justify-between border-border pt-3">
            <span className="text-xl font-bold border border-border rounded-lg px-3 py-1">
              ${Number(order.total)}
            </span>
          </div>
        </div>
      </div>

      <CheckoutDialog
        order={order}
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        onUpdated={onUpdated}
      />

      <Dialog open={voidOpen} onOpenChange={setVoidOpen}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>作廢訂單</DialogTitle>
            <DialogDescription>
              {`此操作將退款並標記為`}
              <Badge className="mx-2" variant="destructive">
                退款
              </Badge>
              {`和`}
              <Badge className="mx-2" variant="destructive">
                已退貨
              </Badge>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setVoidOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleVoidConfirm}
              disabled={isVoiding}
            >
              {isVoiding ? "處理中..." : "確認作廢"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>刪除訂單</DialogTitle>
            <DialogDescription>
              確定要刪除此訂單？此操作無法復原。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "刪除中..." : "確認刪除"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
