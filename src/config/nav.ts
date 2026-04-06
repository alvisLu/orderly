import {
  ClipboardList,
  Package,
  Store,
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
      { title: "訂單管理", url: "/orders", icon: ClipboardList },
    ],
  },
  {
    label: "商品",
    color: "bg-secondary",
    items: [{ title: "商品管理", url: "/products", icon: Package }],
  },
  {
    label: "設定",
    color: "bg-muted-foreground",
    items: [{ title: "設定", url: "/settings", icon: Store }],
  },
];

export type NavGroupItem = {
  title: string;
  icon: React.ElementType;
  url?: string;
  sub?: { title: string; url: string; icon?: React.ElementType }[];
};

export type NavGroup = {
  label: string;
  color: string;
  items: NavGroupItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "訂單管理",
    color: "bg-primary",
    items: [
      {
        title: "訂單管理",
        icon: ClipboardList,
        sub: [
          { title: "處理中訂單", url: "/orders/restaurant" },
          { title: "訂單列表", url: "/orders/list" },
        ],
      },
    ],
  },
  {
    label: "商品管理",
    color: "bg-secondary",
    items: [
      {
        title: "商品管理",
        icon: Package,
        sub: [
          { title: "商品列表", url: "/products/list" },
          { title: "目錄管理", url: "/products/categories" },
          { title: "商品選項", url: "/products/productTypes" },
        ],
      },
    ],
  },
  {
    label: "商店設定",
    color: "bg-muted-foreground",
    items: [
      {
        title: "設定",
        icon: Store,
        sub: [
          { title: "店家資料", url: "/settings/stores/profile" },
          { title: "桌位管理", url: "/settings/tables" },
          { title: "付款管理", url: "/settings/payments" },
        ],
      },
    ],
  },
];
