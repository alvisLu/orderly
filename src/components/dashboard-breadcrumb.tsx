"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const PATH_LABELS: Record<string, string> = {
  orders: "訂單",
  restaurant: "處理中",
  products: "商品管理",
  list: "商品列表",
  categories: "目錄管理",
  types: "商品選項",
  settings: "設定",
  stores: "商店",
  profile: "店家資料",
  tables: "桌位管理",
  payments: "付款管理",
};

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.length === 0 ? (
          <BreadcrumbItem>
            <BreadcrumbPage>主選單</BreadcrumbPage>
          </BreadcrumbItem>
        ) : segments.map((seg, i) => {
          const href = "/" + segments.slice(0, i + 1).join("/");
          const label = PATH_LABELS[seg] ?? seg;
          const isLast = i === segments.length - 1;

          return (
            <BreadcrumbItem key={href}>
              {i > 0 && <BreadcrumbSeparator />}
              {isLast ? (
                <BreadcrumbPage>{label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={href}>{label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
