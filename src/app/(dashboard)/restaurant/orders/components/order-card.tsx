"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Printer, Pencil, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Order, LineItemOption } from "@/modules/orders/types";
import type {
  OrderStatus,
  OrderFinancialStatus,
  OrderFulfillmentStatus,
} from "@/generated/prisma/client";
import { OrderDetailSheet } from "./order-detail-sheet";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "待處理", variant: "outline" },
  processing: { label: "處理中", variant: "default" },
  done: { label: "完成", variant: "secondary" },
  cancelled: { label: "已取消", variant: "destructive" },
};

const HEADER_BG: Record<OrderStatus, string> = {
  pending: "bg-muted",
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

interface Props {
  order: Order;
  onUpdated: (order: Order) => void;
  onDeleted: (id: string) => void;
}

export function OrderCard({ order, onUpdated, onDeleted }: Props) {
  const [detailOpen, setDetailOpen] = useState(false);

  const statusConfig = STATUS_CONFIG[order.status];
  const headerBg = HEADER_BG[order.status];
  const headerText = HEADER_TEXT[order.status];
  const created = dayjs(order.createdAt);
  const fulfillmentVariant = FULFILLMENT_VARIANT[order.fulfillmentStatus];
  const financialVariant = FINANCIAL_VARIANT[order.financialStatus];

  return (
    <>
      <div className="rounded-xl border-2 border-border overflow-hidden shadow-sm">
        {/* Header bar */}
        <div
          className={`${headerBg} ${headerText} px-4 py-2 flex items-center justify-end`}
        >
          <span className="font-semibold text-sm">
            櫃檯:{order.source === "qrcode" ? "QR" : "店面"}
          </span>
        </div>

        {/* Content */}
        <div className="bg-card text-card-foreground px-4 py-3 space-y-3">
          {/* Status & badges row */}
          <div className="flex items-center justify-between">
            <Badge variant={statusConfig.variant} size="lg">
              {statusConfig.label}
            </Badge>
            <div className="flex items-center gap-1.5">
              <Badge variant={fulfillmentVariant} size="lg">
                {FULFILLMENT_LABEL[order.fulfillmentStatus]}
              </Badge>
              <Badge variant={financialVariant} size="lg">
                {FINANCIAL_LABEL[order.financialStatus]}
              </Badge>
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
                const options =
                  item.itemOptions as unknown as LineItemOption[];
                const isFulfilled = order.fulfillmentStatus === "fulfilled";
                return (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-start gap-2">
                      {/* Check / circle */}
                      <div className="mt-1 shrink-0">
                        {isFulfilled ? (
                          <Check className="h-5 w-5 text-secondary" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                        )}
                      </div>
                      {/* Name */}
                      <span className="flex-1 text-lg font-medium leading-tight">
                        {item.name}
                      </span>
                      {/* Time */}
                      <span className="text-base text-muted-foreground shrink-0">
                        {dayjs(item.createdAt).format("HH:mm")}
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
                      <div className="flex flex-wrap gap-1 pl-7">
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

          {/* Footer: total & edit */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-xl font-bold border border-border rounded-lg px-3 py-1">
              ${Number(order.total)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setDetailOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <OrderDetailSheet
        orderId={detailOpen ? order.id : null}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdated={onUpdated}
        onDeleted={onDeleted}
      />
    </>
  );
}
