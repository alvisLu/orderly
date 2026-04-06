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

/** 優先用完整路徑匹配，fallback 到 segment 名稱 */
const FULL_PATH_LABELS: Record<string, string> = {
  "/orders": "訂單管理",
  "/orders/restaurant": "處理中",
  "/orders/list": "訂單列表",
  "/products": "商品管理",
  "/products/list": "商品列表",
  "/products/categories": "目錄管理",
  "/products/productTypes": "商品選項",
  "/settings": "設定",
  "/settings/stores": "商店",
  "/settings/stores/profile": "店家資料",
  "/settings/tables": "桌位管理",
  "/settings/payments": "付款管理",
};

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {segments.length === 0 ? (
            <BreadcrumbPage>主選單</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href="/">主選單</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {segments.map((seg, i) => {
          const href = "/" + segments.slice(0, i + 1).join("/");
          const label = FULL_PATH_LABELS[href] ?? seg;
          const isLast = i === segments.length - 1;

          return (
            <BreadcrumbItem key={href}>
              <BreadcrumbSeparator />
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
