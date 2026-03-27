"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { apiCreateCategory } from "@/app/api/categories/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/modules/categories/types";

const schema = z.object({
  name: z.string().min(1, "請輸入目錄名稱"),
  rank: z.coerce.number().int().nonnegative().default(0),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  nextRank: number;
  onCreated: (category: Category) => void;
}

export function CreateCategoryDialog({ nextRank, onCreated }: Props) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rank: nextRank },
  });

  async function onSubmit(values: FormValues) {
    try {
      const category = await apiCreateCategory(values);
      reset({ rank: nextRank + 1 });
      setOpen(false);
      onCreated(category);
    } catch {
      toast.error("新增目錄失敗");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">新增目錄</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">新增目錄</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-base">
              目錄名稱 *
            </Label>
            <Input id="name" className="h-10" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
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
              {isSubmitting ? "新增中..." : "新增"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
