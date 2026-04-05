"use client";

import { ReceiptText, CircleDollarSign, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type {
  OrderStatus,
  OrderFinancialStatus,
  OrderFulfillmentStatus,
} from "@/generated/prisma/client";

const statusMap: Record<
  OrderStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "待處理", variant: "outline" },
  processing: { label: "處理中", variant: "default" },
  cancelled: { label: "已取消", variant: "destructive" },
  done: { label: "完成", variant: "secondary" },
};

const financialMap: Record<
  OrderFinancialStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "未付款", variant: "default" },
  paid: { label: "已付款", variant: "secondary" },
  refunded: { label: "已退款", variant: "destructive" },
};

const fulfillmentMap: Record<
  OrderFulfillmentStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "待出餐", variant: "default" },
  fulfilled: { label: "已出餐", variant: "secondary" },
  returned: { label: "已退貨", variant: "destructive" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, variant } = statusMap[status] ?? {
    label: status,
    variant: "outline" as const,
  };
  return (
    <Badge variant={variant}>
      <ReceiptText className="w-4 h-4" />
      {label}
    </Badge>
  );
}

export function FinancialStatusBadge({
  status,
}: {
  status: OrderFinancialStatus;
}) {
  const { label, variant } = financialMap[status] ?? {
    label: status,
    variant: "outline" as const,
  };
  return (
    <Badge variant={variant}>
      <CircleDollarSign className="w-4 h-4" />
      {label}
    </Badge>
  );
}

export function FulfillmentStatusBadge({
  status,
}: {
  status: OrderFulfillmentStatus;
}) {
  const { label, variant } = fulfillmentMap[status] ?? {
    label: status,
    variant: "outline" as const,
  };
  return (
    <Badge variant={variant}>
      <UtensilsCrossed className="w-4 h-4" />
      {label}
    </Badge>
  );
}
