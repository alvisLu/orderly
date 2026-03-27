"use client";

import { useEffect, useState } from "react";
import { GripVertical, Trash2 } from "lucide-react";
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
import type { Category } from "@/modules/categories/types";
import { CreateCategoryDialog } from "./components/create-category-dialog";
import { EditCategoryDialog } from "./components/edit-category-dialog";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    apiGetCategories().then(setCategories);
  }, []);

  async function handleValueChange(next: Category[]) {
    setCategories(next);
    try {
      await apiReorderCategories(next.map((c, i) => ({ id: c.id, rank: i })));
    } catch {
      toast.error("排序儲存失敗");
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiDeleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error("刪除目錄失敗");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">目錄管理</h1>
      <div className="flex justify-end mb-4">
        <CreateCategoryDialog
          nextRank={categories.length}
          onCreated={(c) => setCategories((prev) => [...prev, c])}
        />
      </div>
      <Sortable
        value={categories}
        onValueChange={handleValueChange}
        getItemValue={(c) => c.id}
        orientation="vertical"
      >
        <SortableContent className="space-y-2">
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
                  onClick={() => handleDelete(category.id)}
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
    </div>
  );
}
