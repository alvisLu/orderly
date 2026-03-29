"use client";

import { useEffect, useState, useTransition } from "react";
import { GripVertical, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  apiGetCategories,
  apiDeleteCategory,
  apiReorderCategories,
} from "@/app/api/categories/api";
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from "@/components/ui/sortable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { Category } from "@/modules/categories/types";
import { CreateCategoryDialog } from "./components/create-category-dialog";
import { EditCategoryDialog } from "./components/edit-category-dialog";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, startLoading] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    startLoading(async () => {
      const data = await apiGetCategories();
      setCategories(data);
    });
  }, []);

  async function handleValueChange(next: Category[]) {
    setCategories(next);
    try {
      await apiReorderCategories(next.map((c, i) => ({ id: c.id, rank: i })));
      toast.success("排序已更新");
    } catch {
      toast.error("排序儲存失敗");
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    try {
      await apiDeleteCategory(deletingId);
      setCategories((prev) => prev.filter((c) => c.id !== deletingId));
    } catch {
      toast.error("刪除目錄失敗");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold mb-4">目錄管理</h1>
        <div className="flex justify-end mb-4">
          <CreateCategoryDialog
            nextRank={categories.length}
            onCreated={(c) => setCategories((prev) => [...prev, c])}
          />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center">
        {categories.length ? (
          <Sortable
            value={categories}
            onValueChange={handleValueChange}
            getItemValue={(c) => c.id}
            orientation="vertical"
          >
            <SortableContent className="space-y-2 w-[50vh]">
              {categories.map((category) => (
                <SortableItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-3 rounded-md border bg-card px-4 py-3">
                    <SortableItemHandle>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </SortableItemHandle>
                    <span className="flex-1 text-sm font-medium">
                      {category.name}
                    </span>
                    <EditCategoryDialog
                      category={category}
                      onUpdated={(updated) =>
                        setCategories((prev) =>
                          prev.map((c) => (c.id === updated.id ? updated : c))
                        )
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeletingId(category.id)}
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
          <p className="text-lg text-muted-foreground">未新增目錄</p>
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
              此操作無法還原，確定要刪除此目錄嗎？
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
