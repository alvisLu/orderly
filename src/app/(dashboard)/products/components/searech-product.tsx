"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowDownNarrowWide, ArrowUpNarrowWide } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Scroller } from "@/components/ui/scroller";
import type { Category } from "@/modules/categories/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORT_BY_OPTIONS = [
  { value: "created_at", label: "日期排序" },
  { value: "name", label: "名稱排序" },
];

export function SearchProduct({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const search = searchParams.get("search") ?? "";
  const categoryId = searchParams.get("category_id") ?? "";
  const isFavorite = searchParams.get("is_favorite") === "true";
  const sortBy = searchParams.get("sort_by") ?? "created_at";
  const sortOrder = searchParams.get("sort_order") ?? "asc";

  return (
    <Scroller orientation="horizontal" className="mb-4">
      <div className="flex items-center gap-2 w-max">
        <Select
          value={categoryId || "all"}
          onValueChange={(value) =>
            updateParam({ category_id: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger size="lg" className="w-36 shrink-0 truncate">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部目錄</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="搜尋商品名稱..."
          defaultValue={search}
          size="lg"
          className="w-56 shrink-0"
          onChange={(e) => {
            const value = e.target.value;
            const timeoutId = setTimeout(() => {
              updateParam({ search: value });
            }, 300);
            return () => clearTimeout(timeoutId);
          }}
        />

        <div className="flex items-center gap-2 shrink-0">
          <Select
            value={sortBy}
            onValueChange={(value) => updateParam({ sort_by: value })}
          >
            <SelectTrigger size="lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_BY_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="size-10"
            onClick={() =>
              updateParam({ sort_order: sortOrder === "asc" ? "desc" : "asc" })
            }
          >
            {sortOrder === "asc" ? (
              <ArrowUpNarrowWide className="size-4" />
            ) : (
              <ArrowDownNarrowWide className="size-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2 shrink-0 pr-2">
          <Checkbox
            id="is_favorite"
            checked={isFavorite}
            onCheckedChange={(checked) =>
              updateParam({ is_favorite: checked ? "true" : undefined })
            }
          />
          <Label htmlFor="is_favorite">我的最愛</Label>
        </div>
      </div>
    </Scroller>
  );
}
