import {
  ClipboardList,
  ConciergeBell,
  Package,
  Store,
  TableProperties,
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
      { title: "訂單列表", url: "/orders", icon: ClipboardList },
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
    items: [
      { title: "付款管理", url: "/payments", icon: WalletCards },
      { title: "桌位管理", url: "/tables", icon: TableProperties },
      { title: "店家資料", url: "/store/profile", icon: Store },
    ],
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
        title: "處理中訂單",
        icon: ConciergeBell,
        url: "/orders/restaurant",
      },
      {
        title: "訂單列表",
        icon: ClipboardList,
        url: "/orders",
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
          { title: "商品選項", url: "/products/types" },
        ],
      },
    ],
  },
  {
    label: "商店設定",
    color: "bg-muted-foreground",
    items: [
      {
        title: "付款管理",
        icon: WalletCards,
        url: "/payments",
      },
      {
        title: "桌位管理",
        icon: TableProperties,
        url: "/tables",
      },
      {
        title: "店家資料",
        icon: Store,
        url: "/store/profile",
      },
    ],
  },
];
