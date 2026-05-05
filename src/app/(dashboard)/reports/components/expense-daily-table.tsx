"use client";

import dayjs from "@/lib/dayjs";
import type { Expenses } from "@/modules/expenses/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ExpenseDailyTable({
  expenses,
  isLoading,
}: {
  expenses: Expenses[] | null;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>支出明細</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && !expenses ? (
          <Skeleton className="h-64 w-full" />
        ) : !expenses || expenses.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            區間內無支出紀錄
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日期</TableHead>
                  <TableHead>類型</TableHead>
                  <TableHead>付款方式</TableHead>
                  <TableHead className="text-right">金額</TableHead>
                  <TableHead>代墊</TableHead>
                  <TableHead>備註</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">
                      {dayjs(e.expendAt).format("YYYY-MM-DD")}
                    </TableCell>
                    <TableCell>{e.expendType ?? "-"}</TableCell>
                    <TableCell>{e.payMethod ?? "-"}</TableCell>
                    <TableCell className="text-right tabular-nums text-destructive">
                      -{Number(e.price).toLocaleString()}
                    </TableCell>
                    <TableCell>{e.reimburse ?? "-"}</TableCell>
                    <TableCell className="max-w-xs">
                      <span className="line-clamp-1">
                        {e.description ?? "-"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
