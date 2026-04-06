"use client";

import { CircleCheckBig, CircleDollarSign, Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OrderSuccess({
  tableName,
  onContinue,
  onViewOrders,
}: {
  tableName: string;
  onContinue: () => void;
  onViewOrders: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center">
      <div className=" flex flex-col items-start gap-2">
        <p className="flex items-start gap-2 text-muted-foreground">
          <CircleCheckBig className="text-primary" />
          桌號：{tableName}，訂單已送出...
        </p>
        <p className="text-2xl font-bold flex items-center gap-2">
          <CircleDollarSign className="text-yellow-500" />
          請到櫃檯結帳
        </p>
        <p className="flex items-start gap-2 text-muted-foreground">
          <Recycle className="text-secondary" />
          用餐完請將餐盤回收
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={onContinue} size="xl">
          繼續點餐
        </Button>
        <Button variant="secondary" onClick={onViewOrders} size="xl">
          查看訂單
        </Button>
      </div>
    </div>
  );
}
