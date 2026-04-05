"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Big from "big.js";
import { apiUpdateOrder } from "@/app/api/orders/api";
import { apiGetPayments } from "@/app/api/payments/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calculator } from "@/components/shared/calculator";
import type { Payment } from "@/generated/prisma/client";
import type { Order } from "@/modules/orders/types";

interface Props {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (order: Order) => void;
}

export function CheckoutDialog({ order, open, onOpenChange, onUpdated }: Props) {
  const total = Number(order.total);
  const [calcValue, setCalcValue] = useState(total.toString());
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCalcValue(total.toString());
    apiGetPayments().then((r) => {
      setPayments(r);
      setSelectedPayment(r.length > 0 ? r[0] : null);
    });
  }, [open, total]);

  const change = Big(calcValue || "0").minus(total).toNumber();

  function buildTransaction() {
    if (!selectedPayment) return undefined;
    return {
      type: "checkout" as const,
      amount: total,
      gateway: { id: selectedPayment.id, name: selectedPayment.name },
    };
  }

  async function handlePay() {
    if (!selectedPayment) return;
    setIsSubmitting(true);
    try {
      const updated = await apiUpdateOrder(order.id, {
        financialStatus: "paid",
        transaction: buildTransaction(),
      });
      toast.success("已結帳");
      onOpenChange(false);
      onUpdated(updated);
    } catch {
      toast.error("結帳失敗");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePayAndFulfill() {
    if (!selectedPayment) return;
    setIsSubmitting(true);
    try {
      const updated = await apiUpdateOrder(order.id, {
        financialStatus: "paid",
        fulfillmentStatus: "fulfilled",
        transaction: buildTransaction(),
      });
      toast.success("已結帳並出餐");
      onOpenChange(false);
      onUpdated(updated);
    } catch {
      toast.error("結帳失敗");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>付款方式</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <div className="flex space-y-1 justify-between font-semibold text-2xl">
            <div className="flex">
              <span>總額: </span>
              <span>${total || 0}</span>
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
              <div className="flex flex-col justify-between gap-2">
                <div className="flex justify-between">
                  <Button variant="outline" size="xl" onClick={() => setCalcValue("100")}>$100</Button>
                  <Button variant="outline" size="xl" onClick={() => setCalcValue("200")}>$200</Button>
                  <Button variant="outline" size="xl" onClick={() => setCalcValue("500")}>$500</Button>
                  <Button variant="outline" size="xl" onClick={() => setCalcValue("1000")}>$1000</Button>
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
