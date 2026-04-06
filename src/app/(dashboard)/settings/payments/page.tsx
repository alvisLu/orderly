"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, GripVertical, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  apiGetPayments,
  apiDeletePayment,
  apiReorderPayments,
} from "@/app/api/payments/api";
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from "@/components/ui/sortable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { Payment } from "@/modules/payments/types";
import { CreatePaymentDialog } from "./components/create-payment-dialog";
import { EditPaymentDialog } from "./components/edit-payment-dialog";

const PAYMENT_TYPE_LABEL: Record<string, string> = {
  cash: "現金",
  custom: "自訂付款",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, startLoading] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    startLoading(async () => {
      const data = await apiGetPayments();
      setPayments(data);
    });
  }, []);

  async function handleValueChange(next: Payment[]) {
    setPayments(next);
    try {
      await apiReorderPayments(next.map((p, i) => ({ id: p.id, rank: i })));
      toast.success("排序已更新");
    } catch {
      toast.error("排序儲存失敗");
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    try {
      await apiDeletePayment(deletingId);
      setPayments((prev) => prev.filter((p) => p.id !== deletingId));
    } catch {
      toast.error("刪除付款方式失敗");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">付款方式管理</h1>
      <div className="flex justify-end mb-4">
        <CreatePaymentDialog
          nextRank={payments.length}
          onCreated={(p) => setPayments((prev) => [...prev, p])}
        />
      </div>
      <div className="flex flex-1 items-center justify-center">
        {payments.length ? (
          <Sortable
            value={payments}
            onValueChange={handleValueChange}
            getItemValue={(p) => p.id}
            orientation="vertical"
          >
            <SortableContent className="space-y-2 w-[70vh]">
              {payments.map((payment) => (
                <SortableItem key={payment.id} value={payment.id}>
                  <div className="flex items-center gap-3 rounded-md border bg-card px-4 py-3">
                    <SortableItemHandle>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </SortableItemHandle>
                    <span className="flex-1 text-sm font-medium">
                      {payment.name}
                    </span>
                    <Badge variant="outline">
                      {PAYMENT_TYPE_LABEL[payment.type]}
                    </Badge>
                    <Badge
                      variant={
                        payment.isPosAvailable ? "secondary" : "destructive"
                      }
                    >
                      {payment.isPosAvailable ? <Check /> : <X />}
                      POS
                    </Badge>
                    <Badge
                      variant={
                        payment.isMenuAvailable ? "secondary" : "destructive"
                      }
                    >
                      {payment.isMenuAvailable ? <Check /> : <X />}
                      線上
                    </Badge>
                    <EditPaymentDialog
                      payment={payment}
                      onUpdated={(updated) =>
                        setPayments((prev) =>
                          prev.map((p) => (p.id === updated.id ? updated : p))
                        )
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeletingId(payment.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </SortableItem>
              ))}
            </SortableContent>
            <SortableOverlay>
              <div className="h-full rounded-md bg-primary/10 border" />
            </SortableOverlay>
          </Sortable>
        ) : isLoading ? (
          <div>
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <p className="text-lg text-muted-foreground">未新增付款方式</p>
        )}
      </div>

      <Dialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              此操作無法還原，確定要刪除此付款方式嗎？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
