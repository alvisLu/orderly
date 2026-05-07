"use client";

import { useEffect, useRef, useState } from "react";
import type { Order } from "@/modules/orders/types";
import { OrderCard } from "./order-card";

interface Props {
  orders: Order[];
  onUpdated: (order: Order) => void;
  onDeleted: (id: string) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}

function useColumnCount(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [cols, setCols] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      if (width >= 1280) setCols(4);
      else if (width >= 1024) setCols(3);
      else if (width >= 768) setCols(2);
      else setCols(1);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  return cols;
}

function distributeToColumns(orders: Order[], colCount: number): Order[][] {
  const columns: Order[][] = Array.from({ length: colCount }, () => []);
  for (let i = 0; i < orders.length; i++) {
    columns[i % colCount].push(orders[i]);
  }
  return columns;
}

export function OrderColumns({
  orders,
  onUpdated,
  onDeleted,
  selectedIds,
  onToggleSelect,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const colCount = useColumnCount(containerRef);
  const columns = distributeToColumns(orders, colCount);

  return (
    <div ref={containerRef} className="flex gap-4 items-start">
      {columns.map((colOrders, colIdx) => (
        <div key={colIdx} className="flex-1 min-w-0 space-y-4">
          {colOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdated={onUpdated}
              onDeleted={onDeleted}
              selected={selectedIds?.has(order.id)}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
