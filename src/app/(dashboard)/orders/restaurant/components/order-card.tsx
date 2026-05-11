"use client";

import { createContext, useContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Printer,
  Utensils,
  CircleDollarSign,
  Trash2,
  Truck,
  BookmarkX,
  LogOut,
  ChefHat,
  Copy,
  NotebookPen,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  apiGetOrder,
  apiUpdateOrder,
  apiDeleteOrder,
} from "@/app/api/orders/api";
import { CheckoutDialog } from "@/app/(dashboard)/orders/components/checkout-dialog";
import { CreateOrderDialog } from "@/app/(dashboard)/orders/components/create-order-dialog";
import { useNewOrdersStore } from "@/store/new-orders";
import { Scroller } from "@/components/ui/scroller";
import { Spinner } from "@/components/ui/spinner";
import type { Order, LineItemOption } from "@/modules/orders/types";
import {
  OrderStatus,
  OrderFinancialStatus,
  OrderFulfillmentStatus,
} from "@/generated/prisma/client";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  partiallyFulfilled: "部分",
  fulfilled: "已出",
  returned: "退貨",
};

const FULFILLMENT_VARIANT: Record<
  OrderFulfillmentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  partiallyFulfilled: "outline",
  fulfilled: "secondary",
  returned: "destructive",
};

export const InPopupContext = createContext(false);

type Transaction = {
  type: string;
  amount: number;
  gateway: { name: string };
  date?: string;
};

function TransactionList({ transactions }: { transactions: unknown }) {
  const txns = (transactions as Transaction[] | null) ?? [];
  if (txns.length === 0) return null;
  return (
    <Card size="sm" className="shadow-lg ring-0">
      <CardHeader>交易紀錄</CardHeader>
      <CardContent className="space-y-1">
        {txns.map((tx, i) => (
          <div
            key={i}
            className="flex items-center text-sm text-muted-foreground"
          >
            <span className="flex-1">{tx.gateway.name}</span>
            {tx.date && (
              <span className="text-xs mr-2">
                {dayjs(tx.date).format("YYYY-MM-DD HH:mm")}
              </span>
            )}
            <span className="text-right shrink-0 min-w-[60px]">
              ${tx.amount}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CardVisual({
  order,
  onUpdated,
  onDeleted,
  selected,
  onToggleSelect,
}: {
  order: Order;
  onUpdated: (order: Order) => void;
  onDeleted: (id: string) => void;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
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

  const footerAction = inPopup ? null : order.status === "pending" ? (
    <Button
      size="lg"
      variant="secondary"
      onClick={handleAccept}
      disabled={isAccepting}
    >
      {isAccepting ? (
        <Spinner />
      ) : (
        <>
          <ChefHat />
          接單
        </>
      )}
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
        className={`${headerBg} ${headerText} px-4 py-2 h-12 flex items-center justify-between ${
          onHeaderClick ? "cursor-pointer" : ""
        }`}
      >
        <span className="font-semibold text-sm">
          {order.source === "qrcode" ? "QR" : "店面"}
          {order.takeNumber && ` #${order.takeNumber}`}
        </span>
        {!inPopup &&
          onToggleSelect &&
          order.financialStatus === "pending" &&
          order.fulfillmentStatus === "pending" && (
            <Checkbox
              variant="outline"
              size="lg"
              checked={selected}
              onClick={(e) => e.stopPropagation()}
              onCheckedChange={() => onToggleSelect(order.id)}
              aria-label="選擇訂單"
              className="bg-background"
            />
          )}
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
            <span className="text-muted-foreground text-base">
              {created.format("MM/DD")}-{created.format("HH:mm")}
            </span>
          </div>
          {!inPopup && (
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Printer className="h-5 w-5" />
            </Button>
          )}
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
                    <div className="flex-1 flex items-baseline justify-between gap-2 pr-2">
                      <span className="text-lg font-medium leading-tight">
                        {item.name}
                      </span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {dayjs(item.createdAt).format("HH:mm")}
                      </span>
                    </div>
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

        {/* Client note */}
        {order.userNote && (
          <p className="text-sm text-muted-foreground border border-border rounded-md px-3 py-2">
            <Label>客戶備註:</Label>
            {order.userNote}
          </p>
        )}

        {/* Staff note */}
        {order.note && (
          <p className="text-sm text-muted-foreground border border-border rounded-md px-3 py-2">
            <Label>備註:</Label>
            {order.note}
          </p>
        )}

        {/* Footer: total & leave */}
        <div className="flex items-center justify-between border-border pt-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold border border-border rounded-lg px-3 py-1">
              ${Number(order.total)}
            </span>
            {footerAction}
          </div>
          {!inPopup && (
            <Button
              size="lg"
              variant="destructive"
              onClick={() => setLeaveOpen(true)}
            >
              <LogOut />
            </Button>
          )}
        </div>
      </div>

      {!inPopup && (
        <>
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
        </>
      )}
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
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function OrderCard({
  order,
  onUpdated,
  onDeleted,
  selected,
  onToggleSelect,
}: Props) {
  return (
    <CardVisual
      order={order}
      onUpdated={onUpdated}
      onDeleted={onDeleted}
      selected={selected}
      onToggleSelect={onToggleSelect}
    />
  );
}

interface PopupProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (order: Order) => void;
  onDeleted: (id: string) => void;
  showDeleted?: boolean;
}

export function OrderCardPopup({
  order,
  open,
  onOpenChange,
  onUpdated,
  onDeleted,
  showDeleted,
}: PopupProps) {
  const [data, setData] = useState<Order>(order);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [voidOpen, setVoidOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [appendOpen, setAppendOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState(order.note ?? "");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    setData(order);
  }, [order]);

  useEffect(() => {
    if (!open) return;
    apiGetOrder(order.id, { showDeleted }).then(setData);
  }, [open, order.id, showDeleted]);

  async function handleLeaveConfirm() {
    setIsLeaving(true);
    try {
      const updated = await apiUpdateOrder(data.id, { isDining: false });
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

  async function handleNoteSave() {
    setIsSavingNote(true);
    try {
      const updated = await apiUpdateOrder(data.id, { note: noteText });
      onUpdated(updated);
      setNoteOpen(false);
      toast.success("已更新備註");
    } catch {
      toast.error("更新失敗");
    } finally {
      setIsSavingNote(false);
    }
  }

  async function handleFulfill() {
    try {
      const updated = await apiUpdateOrder(data.id, {
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
      const updated = await apiUpdateOrder(data.id, {
        status: "cancelled",
        fulfillmentStatus: "returned",
        financialStatus: "refunded",
        gateway: {
          id: "refund",
          name:
            (data.transactions as Transaction[] | null)?.[0]?.gateway.name ??
            "系統退款",
        },
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
      await apiDeleteOrder(data.id);
      setDeleteOpen(false);
      onOpenChange(false);
      onDeleted(data.id);
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
          <div className="flex flex-col sm:flex-row sm:justify-center">
            <Scroller className="w-full sm:w-[26rem] sm:shrink-0 max-h-[60vh] sm:max-h-[80vh] p-3">
              <InPopupContext.Provider value={true}>
                <div className="flex flex-col gap-4">
                  <CardVisual
                    order={data}
                    onUpdated={onUpdated}
                    onDeleted={onDeleted}
                  />
                  {/* Transactions */}
                  <TransactionList transactions={data.transactions} />
                </div>
              </InPopupContext.Provider>
            </Scroller>
            <div className="flex gap-2 sm:items-stretch p-3">
              <div className="flex flex-col gap-2 flex-1 sm:flex-initial sm:w-32">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setCloneOpen(true);
                    onOpenChange(false);
                  }}
                >
                  <Copy />
                  複製訂單
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setNoteText(data.note ?? "");
                    setNoteOpen(true);
                  }}
                >
                  <NotebookPen />
                  修改備註
                </Button>
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
                  disabled={data.financialStatus !== "pending"}
                >
                  <CircleDollarSign />
                  結帳
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleFulfill}
                  disabled={
                    data.fulfillmentStatus !== "pending" &&
                    data.fulfillmentStatus !== "partiallyFulfilled"
                  }
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
                      onClick={() => {
                        setAppendOpen(true);
                        onOpenChange(false);
                      }}
                      disabled={data.financialStatus !== "pending"}
                    >
                      <Plus />
                      追加商品
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setVoidOpen(true)}
                      disabled={data.status === "cancelled"}
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
        order={data}
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

      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>修改備註</DialogTitle>
          </DialogHeader>
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={4}
            placeholder="輸入備註"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setNoteOpen(false)}>
              取消
            </Button>
            <Button onClick={handleNoteSave} disabled={isSavingNote}>
              {isSavingNote ? <Spinner /> : "儲存"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CreateOrderDialog
        open={cloneOpen}
        onOpenChange={setCloneOpen}
        initialOrder={data}
        onCreated={(o) => useNewOrdersStore.getState().publish([o])}
      />

      <CreateOrderDialog
        open={appendOpen}
        onOpenChange={setAppendOpen}
        appendToOrder={data}
        onCreated={(o) => {
          setData(o);
          onUpdated(o);
        }}
      />
    </>
  );
}
