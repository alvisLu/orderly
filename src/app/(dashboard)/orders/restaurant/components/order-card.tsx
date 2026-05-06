"use client";

import { createContext, useContext, useState } from "react";
import dayjs from "dayjs";
import {
  Printer,
  Utensils,
  CircleDollarSign,
  Trash2,
  Truck,
  BookmarkX,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiUpdateOrder, apiDeleteOrder } from "@/app/api/orders/api";
import { CheckoutDialog } from "@/app/(dashboard)/orders/components/checkout-dialog";
import { Scroller } from "@/components/ui/scroller";
import { Spinner } from "@/components/ui/spinner";
import type { Order, LineItemOption } from "@/modules/orders/types";
import {
  OrderStatus,
  OrderFinancialStatus,
  OrderFulfillmentStatus,
} from "@/generated/prisma/client";
import { Label } from "@/components/ui/label";

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

const InPopupContext = createContext(false);

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
            {tx.type === "checkout" ? "付款" : "退款"}: {tx.gateway.name}
          </span>
          <span>${tx.amount}</span>
        </div>
      ))}
    </div>
  );
}

function CardVisual({
  order,
  onUpdated,
  onDeleted,
}: {
  order: Order;
  onUpdated: (order: Order) => void;
  onDeleted: (id: string) => void;
}) {
  const inPopup = useContext(InPopupContext);
  const [popupOpen, setPopupOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

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

  async function handleLeaveConfirm() {
    setIsLeaving(true);
    try {
      const updated = await apiUpdateOrder(order.id, { isDining: false });
      onUpdated(updated);
      setLeaveOpen(false);
      toast.success("已離場");
    } catch {
      toast.error("更新失敗");
    } finally {
      setIsLeaving(false);
    }
  }

  const onHeaderClick =
    inPopup || order.status === "pending"
      ? undefined
      : () => setPopupOpen(true);

  const headerBg = HEADER_BG[order.status];
  const headerText = HEADER_TEXT[order.status];
  const created = dayjs(order.createdAt);
  const orderStatusVariant = ORDER_STATUS_VARIANT[order.status];
  const fulfillmentVariant = FULFILLMENT_VARIANT[order.fulfillmentStatus];
  const financialVariant = FINANCIAL_VARIANT[order.financialStatus];

  const footerAction =
    order.status === "pending" ? (
      <Button
        size="lg"
        variant="secondary"
        onClick={handleAccept}
        disabled={isAccepting}
      >
        {isAccepting ? <Spinner /> : "接單"}
      </Button>
    ) : order.financialStatus === "pending" ? (
      <Button
        size="lg"
        variant="secondary"
        onClick={(e) => {
          e.stopPropagation();
          setCheckoutOpen(true);
        }}
      >
        <CircleDollarSign />
        結帳
      </Button>
    ) : null;

  return (
    <div className="rounded-xl border-border overflow-hidden shadow-lg">
      {/* Header bar */}
      <div
        role={onHeaderClick ? "button" : undefined}
        tabIndex={onHeaderClick ? 0 : undefined}
        aria-label={onHeaderClick ? "開啟訂單操作" : undefined}
        onClick={onHeaderClick}
        onKeyDown={
          onHeaderClick
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onHeaderClick();
                }
              }
            : undefined
        }
        className={`${headerBg} ${headerText} px-4 py-2 h-12 flex items-center ${
          onHeaderClick ? "cursor-pointer" : ""
        }`}
      >
        <span className="font-semibold text-sm">
          {order.source === "qrcode" ? "QR" : "店面"}
          {order.takeNumber && ` #${order.takeNumber}`}
        </span>
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

        {/* Client note */}
        {order.userNote && (
          <>
            <p className="text-sm text-muted-foreground border border-border rounded-md px-3 py-2">
              <Label>備註:</Label>
              {order.userNote}
            </p>
          </>
        )}

        {/* Footer: total & leave */}
        <div className="flex items-center justify-between border-border pt-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold border border-border rounded-lg px-3 py-1">
              ${Number(order.total)}
            </span>
            {footerAction}
          </div>
          <Button
            size="lg"
            variant="destructive"
            onClick={() => setLeaveOpen(true)}
          >
            <LogOut />
          </Button>
        </div>
      </div>

      <CheckoutDialog
        order={order}
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        onUpdated={onUpdated}
      />

      <LeaveConfirmDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        onConfirm={handleLeaveConfirm}
        isLeaving={isLeaving}
      />

      <OrderCardPopup
        order={order}
        open={popupOpen}
        onOpenChange={setPopupOpen}
        onUpdated={onUpdated}
        onDeleted={onDeleted}
      />
    </div>
  );
}

function LeaveConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isLeaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLeaving: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>離場</DialogTitle>
          <DialogDescription>確定要將此訂單離場？</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLeaving}
          >
            {isLeaving ? <Spinner /> : "確認離場"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface Props {
  order: Order;
  onUpdated: (order: Order) => void;
  onDeleted: (id: string) => void;
}

export function OrderCard({ order, onUpdated, onDeleted }: Props) {
  return (
    <CardVisual order={order} onUpdated={onUpdated} onDeleted={onDeleted} />
  );
}

interface PopupProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (order: Order) => void;
  onDeleted: (id: string) => void;
}

export function OrderCardPopup({
  order,
  open,
  onOpenChange,
  onUpdated,
  onDeleted,
}: PopupProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [voidOpen, setVoidOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  async function handleLeaveConfirm() {
    setIsLeaving(true);
    try {
      const updated = await apiUpdateOrder(order.id, { isDining: false });
      onUpdated(updated);
      setLeaveOpen(false);
      onOpenChange(false);
      toast.success("已離場");
    } catch {
      toast.error("更新失敗");
    } finally {
      setIsLeaving(false);
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
    try {
      const updated = await apiUpdateOrder(order.id, {
        status: "cancelled",
        fulfillmentStatus: "returned",
        financialStatus: "refunded",
        gateway: { id: "refund", name: "作廢" },
      });
      onUpdated(updated);
      setVoidOpen(false);
      onOpenChange(false);
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
      setDeleteOpen(false);
      onOpenChange(false);
      onDeleted(order.id);
      toast.success("訂單已刪除");
    } catch {
      toast.error("刪除失敗");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="!max-w-3xl">
          <DialogTitle>訂單操作</DialogTitle>
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-center">
            <Scroller className="w-full sm:w-[26rem] sm:shrink-0 max-h-[60vh] sm:max-h-[80vh] p-3">
              <InPopupContext.Provider value={true}>
                <CardVisual
                  order={order}
                  onUpdated={onUpdated}
                  onDeleted={onDeleted}
                />
              </InPopupContext.Provider>
            </Scroller>
            <div className="flex gap-2 sm:items-stretch">
              <div className="flex flex-col flex-1 sm:flex-initial sm:w-32">
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={() => setLeaveOpen(true)}
                >
                  <LogOut />
                  離場
                </Button>
              </div>
              <div className="flex flex-col gap-2 flex-1 sm:w-32">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setCheckoutOpen(true)}
                  disabled={order.financialStatus !== "pending"}
                >
                  <CircleDollarSign />
                  {order.financialStatus === "paid" ? "已結帳" : "結帳"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleFulfill}
                  disabled={order.fulfillmentStatus !== "pending"}
                >
                  <Truck />
                  出餐
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="lg">
                      更多
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setVoidOpen(true)}
                      disabled={order.status === "cancelled"}
                      className="text-destructive"
                    >
                      <BookmarkX />
                      作廢
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteOpen(true)}
                      className="text-destructive"
                    >
                      <Trash2 />
                      刪除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CheckoutDialog
        order={order}
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        onUpdated={onUpdated}
      />

      <LeaveConfirmDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        onConfirm={handleLeaveConfirm}
        isLeaving={isLeaving}
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
