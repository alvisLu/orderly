"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChartBar,
  ChevronRight,
  ClipboardList,
  Cog,
  LayoutGrid,
  Package,
  ReceiptText,
  ShoppingBag,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";

const navItems = [
  {
    label: "訂單",
    items: [{ title: "訂單管理", url: "/orders", icon: ClipboardList }],
  },
  {
    label: "商品",
    items: [
      { title: "目錄管理", url: "/categories", icon: LayoutGrid },
      {
        title: "商品管理",
        icon: Package,
        sub: [
          { title: "商品列表", url: "/products" },
          { title: "商品選項", url: "/products/options" },
        ],
      },
      { title: "菜單管理", url: "/menus", icon: ShoppingBag },
    ],
  },
  {
    label: "財務",
    items: [
      {
        title: "支出管理",
        icon: Wallet,
        sub: [
          { title: "支出列表", url: "/expenses" },
          { title: "支出報表", url: "/expenses/reports" },
        ],
      },
      { title: "銷售報表", url: "/reports", icon: ChartBar },
    ],
  },
  {
    label: "資料",
    items: [
      { title: "供應商", url: "/suppliers", icon: Store },
      { title: "原物料", url: "/materials", icon: ReceiptText },
      { title: "客戶", url: "/customers", icon: Users },
    ],
  },
];

type NavItem = {
  title: string;
  icon: React.ElementType;
  url?: string;
  sub?: { title: string; url: string }[];
};

function NavMenuItem({ item }: { item: NavItem }) {
  if (item.sub) {
    return (
      <SidebarMenuItem>
        <Collapsible defaultOpen={false} className="group/collapsible w-full">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              <item.icon />
              <span>{item.title}</span>
              <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.sub.map((sub) => (
                <SidebarMenuSubItem key={sub.title}>
                  <SidebarMenuSubButton asChild>
                    <Link href={sub.url}>{sub.title}</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link href={item.url!}>
          <item.icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center group-data-[collapsible=icon]:justify-center">
            <SidebarMenuButton
              size="lg"
              className="group-data-[collapsible=icon]:hidden"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Store className="size-6" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Orderly</span>
                <span className="text-xs text-muted-foreground">POS 系統</span>
              </div>
            </SidebarMenuButton>
            <SidebarTrigger className="ml-auto" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navItems.map((group, i) => (
          <SidebarGroup key={group.label}>
            {i > 0 && <SidebarSeparator />}
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <NavMenuItem key={item.title} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/settings">
                <Cog />
                <span>設定</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
