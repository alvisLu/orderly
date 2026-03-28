"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  pagination?: boolean;
}

export function DataTable<TData>({
  columns,
  data,
  pagination = false,
}: DataTableProps<TData>) {
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(pagination && {
      getPaginationRowModel: getPaginationRowModel(),
      state: { pagination: { pageIndex, pageSize } },
      onPaginationChange: (updater) => {
        const next =
          typeof updater === "function"
            ? updater({ pageIndex, pageSize })
            : updater;
        setPageIndex(next.pageIndex);
        setPageSize(next.pageSize);
      },
    }),
  });

  return (
    <div className="space-y-2">
      {pagination && (
        <div className="flex items-center gap-4 px-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {`${size} 筆`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Pagination className="w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    text="上一頁"
                    onClick={(e) => {
                      e.preventDefault();
                      setPageIndex((p) => p - 1);
                    }}
                    aria-disabled={!table.getCanPreviousPage()}
                    className={
                      !table.getCanPreviousPage()
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
                <span className="text-sm text-muted-foreground">
                  第 {pageIndex + 1} / {table.getPageCount()} 頁
                </span>
                <PaginationItem>
                  <PaginationNext
                    text="下一頁"
                    onClick={(e) => {
                      e.preventDefault();
                      setPageIndex((p) => p + 1);
                    }}
                    aria-disabled={!table.getCanNextPage()}
                    className={
                      !table.getCanNextPage()
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground"
                >
                  沒有商品
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
