import {
  BarChart3,
  ClipboardList,
  ConciergeBell,
  Package,
  Receipt,
  Store,
  WalletCards,
} from "lucide-react";

export type SidebarNavItem = {
  title: string;
  icon: React.ElementType;
  url?: string;
  sub?: { title: string; url: string }[];
};

export type SidebarNav = {
  label: string;
  color: string;
  items: SidebarNavItem[];
};

export const sidebarNav: SidebarNav[] = [
  {
    label: "訂單管理",
    color: "bg-primary",
    items: [
      { title: "處理中訂單", url: "/orders/restaurant", icon: ConciergeBell },
      { title: "訂單列表", url: "/orders/list", icon: ClipboardList },
    ],
  },
  {
    label: "商品",
    color: "bg-secondary",
    items: [
      { title: "商品列表", url: "/products/list", icon: Package },
      // { title: "目錄管理", url: "/products/categories", icon: Package },
      // { title: "商品選項", url: "/products/productTypes", icon: Package },
    ],
  },
  {
    label: "支出",
    color: "bg-info",
    items: [{ title: "支出列表", url: "/expenses", icon: Receipt }],
  },
  {
    label: "報表管理",
    color: "bg-accent",
    items: [{ title: "報表", url: "/reports", icon: BarChart3 }],
  },
  {
    label: "設定",
    color: "bg-muted-foreground",
    items: [
      { title: "商店設定", url: "/settings/", icon: WalletCards },
      // { title: "付款管理", url: "/settings/payments", icon: WalletCards },
      // { title: "桌位管理", url: "/settings/tables", icon: TableProperties },
      // { title: "店家資料", url: "/settings/stores/profile", icon: Store },
    ],
  },
];

export type NavGroupSub = {
  title: string;
  url: string;
  icon?: React.ElementType;
};

export type NavGroup = {
  label: string;
  color: string;
  icon: React.ElementType;
  sub: NavGroupSub[];
};

export const navGroups: Record<string, NavGroup> = {
  "/orders": {
    label: "訂單管理",
    color: "bg-primary",
    icon: ClipboardList,
    sub: [
      { title: "處理中訂單", url: "/orders/restaurant" },
      { title: "訂單列表", url: "/orders/list" },
    ],
  },
  "/products": {
    label: "商品管理",
    color: "bg-secondary",
    icon: Package,
    sub: [
      { title: "商品列表", url: "/products/list" },
      { title: "目錄管理", url: "/products/categories" },
      { title: "商品選項", url: "/products/productTypes" },
    ],
  },
  "/settings": {
    label: "商店設定",
    color: "bg-muted-foreground",
    icon: Store,
    sub: [
      { title: "店家資料", url: "/settings/stores/profile" },
      { title: "桌位管理", url: "/settings/tables" },
      { title: "付款管理", url: "/settings/payments" },
    ],
  },
  "/expenses": {
    label: "支出管理",
    color: "bg-info",
    icon: Receipt,
    sub: [{ title: "支出列表", url: "/expenses" }],
  },
  "/reports": {
    label: "報表管理",
    color: "bg-accent",
    icon: BarChart3,
    sub: [
      { title: "日報表", url: "/reports/daily" },
      { title: "月報表", url: "/reports/monthly" },
    ],
  },
};

export const pathLabels: Record<string, string> = {
  "/orders": "訂單管理",
  "/orders/restaurant": "餐廳訂單",
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
  "/expenses": "支出管理",
  "/reports": "報表管理",
  "/reports/daily": "日報表",
  "/reports/monthly": "月報表",
};
