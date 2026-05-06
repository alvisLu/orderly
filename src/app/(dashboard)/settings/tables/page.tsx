"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { apiGetTables, apiDeleteTable } from "@/app/api/tables/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Table } from "@/modules/tables/types";
import { CreateTableDialog } from "./components/create-table-dialog";
import { TablesGrid } from "./components/tables-grid";

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, startLoading] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    startLoading(async () => {
      const res = await apiGetTables({ page: pageIndex + 1, limit: pageSize });
      setTables(res.data);
      setTotal(res.total);
    });
  }, [pageIndex, pageSize]);

  function handleUpdated(updated: Table) {
    setTables((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function handleCreated() {
    startLoading(async () => {
      const res = await apiGetTables({ page: pageIndex + 1, limit: pageSize });
      setTables(res.data);
      setTotal(res.total);
    });
  }

  async function handleDelete() {
    if (!deletingId) return;
    try {
      await apiDeleteTable(deletingId);
      startLoading(async () => {
        const res = await apiGetTables({
          page: pageIndex + 1,
          limit: pageSize,
        });
        setTables(res.data);
        setTotal(res.total);
      });
    } catch {
      toast.error("刪除桌位失敗");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">桌位管理</h1>
        <CreateTableDialog onCreated={handleCreated} />
      </div>
      <div className="flex-1 min-h-0">
        <TablesGrid
          data={tables}
          isLoading={isLoading}
          onUpdated={handleUpdated}
          onDelete={setDeletingId}
          serverPagination={{
            total,
            pageIndex,
            pageSize,
            onPageChange: setPageIndex,
            onPageSizeChange: (size: number) => {
              setPageSize(size);
              setPageIndex(0);
            },
          }}
        />
      </div>

      <Dialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              此操作無法還原，確定要刪除此桌位嗎？
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
