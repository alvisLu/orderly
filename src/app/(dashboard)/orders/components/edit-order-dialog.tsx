"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { apiUpdateOrder } from "@/app/api/orders/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Order } from "@/modules/orders/types";

const schema = z.object({
  status: z.enum(["pending", "processing", "cancelled", "done"]),
  financialStatus: z.enum(["pending", "paid", "refunded"]),
  fulfillmentStatus: z.enum(["pending", "fulfilled", "returned"]),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.infer<typeof schema>;

interface Props {
  order: Order;
  onUpdated: (order: Order) => void;
}

export function EditOrderDialog({ order, onUpdated }: Props) {
  const [open, setOpen] = useState(false);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: order.status,
      financialStatus: order.financialStatus,
      fulfillmentStatus: order.fulfillmentStatus,
    },
  });

  const values = watch();

  async function onSubmit(data: FormValues) {
    try {
      const updated = await apiUpdateOrder(order.id, data);
      setOpen(false);
      onUpdated(updated);
      toast.success("訂單已更新");
    } catch {
      toast.error("更新訂單失敗");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon" className="h-7 w-7">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>更新訂單狀態</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>訂單狀態</Label>
            <Select
              value={values.status}
              onValueChange={(v) =>
                setValue("status", v as FormValues["status"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">待處理</SelectItem>
                <SelectItem value="processing">處理中</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
                <SelectItem value="done">完成</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>付款狀態</Label>
            <Select
              value={values.financialStatus}
              onValueChange={(v) =>
                setValue("financialStatus", v as FormValues["financialStatus"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">未付款</SelectItem>
                <SelectItem value="paied">已付款</SelectItem>
                <SelectItem value="refunded">已退款</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>出餐狀態</Label>
            <Select
              value={values.fulfillmentStatus}
              onValueChange={(v) =>
                setValue(
                  "fulfillmentStatus",
                  v as FormValues["fulfillmentStatus"]
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">待出餐</SelectItem>
                <SelectItem value="fulfilled">已出餐</SelectItem>
                <SelectItem value="returned">已退貨</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "儲存中..." : "儲存"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
