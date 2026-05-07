"use client";

import { useEffect, useState } from "react";
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
import { Scroller } from "@/components/ui/scroller";
import { Spinner } from "@/components/ui/spinner";
import { apiMergeOrders } from "@/app/api/orders/api";
import type { Order } from "@/modules/orders/types";
import { OrderCard, InPopupContext } from "./order-card";

interface Props {
  orders: Order[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMerged: (primary: Order, secondaryIds: string[]) => void;
}

export function MergeOrdersDialog({
  orders,
  open,
  onOpenChange,
  onMerged,
}: Props) {
  const [primaryId, setPrimaryId] = useState<string | undefined>(orders[0]?.id);
  const [isMerging, setIsMerging] = useState(false);

  useEffect(() => {
    if (open) setPrimaryId(orders[0]?.id);
  }, [open, orders]);

  const noop = () => {};

  async function handleConfirm() {
    if (!primaryId) return;
    const secondaryIds = orders
      .filter((o) => o.id !== primaryId)
      .map((o) => o.id);
    setIsMerging(true);
    try {
      const merged = await apiMergeOrders(primaryId, secondaryIds);
      onMerged(merged, secondaryIds);
      onOpenChange(false);
      toast.success("已合併訂單");
    } catch {
      toast.error("合併失敗");
    } finally {
      setIsMerging(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {`合併訂單: `}
            {orders
              .map((o) => (o.takeNumber ? `#${o.takeNumber}` : null))
              .filter(Boolean)
              .join(", ")}
          </DialogTitle>
          <DialogDescription className="text-destructive">
            合併後，其他訂單的品項會合併進主訂單。
          </DialogDescription>
        </DialogHeader>
        <Scroller className="max-h-[70vh]">
          <InPopupContext.Provider value={true}>
            <div className="flex flex-col gap-4 p-1">
              {orders.map((order) => {
                const isPrimary = order.id === primaryId;
                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setPrimaryId(order.id)}
                    className={`text-left rounded-xl transition-all ${
                      isPrimary
                        ? "ring-4 ring-info"
                        : "ring-1 ring-border opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="relative">
                      {isPrimary && (
                        <Badge
                          variant="third"
                          size="lg"
                          className="absolute top-2 right-2 z-10"
                        >
                          主訂單
                        </Badge>
                      )}
                      <OrderCard
                        order={order}
                        onUpdated={noop}
                        onDeleted={noop}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </InPopupContext.Provider>
        </Scroller>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="xl"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            size="xl"
            onClick={handleConfirm}
            disabled={isMerging || !primaryId || orders.length < 2}
          >
            {isMerging ? <Spinner /> : "確認合併"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
