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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronRight,
  LayoutGrid,
  LogOut,
  ShoppingBag,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CreateOrderDialog } from "@/app/(dashboard)/orders/components/create-order-dialog";
import { sidebarNav, type SidebarNavItem } from "@/config/nav";
import { apiGetStore } from "@/app/api/stores/api";
import { logout } from "@/app/(auth)/actions";
import { useStoreInfo } from "@/store/store-info";
import { version } from "../../package.json";

function NavMenuItem({ item }: { item: SidebarNavItem }) {
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
  const router = useRouter();
  const store = useStoreInfo((s) => s.store);
  const setStore = useStoreInfo((s) => s.setStore);
  useEffect(() => {
    apiGetStore()
      .then(setStore)
      .catch(() => {});
  }, [setStore]);
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center group-data-[collapsible=icon]:justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="group-data-[collapsible=icon]:hidden"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Store className="size-6" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold whitespace-nowrap">
                      {store?.name ?? "Orderly"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      v{version}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="bottom" className="w-56">
                <DropdownMenuItem
                  onSelect={() => {
                    useStoreInfo.getState().clearStore();
                    void logout();
                  }}
                >
                  <LogOut />
                  <span>登出</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <SidebarTrigger className="ml-auto" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <CreateOrderDialog
                trigger={
                  <SidebarMenuButton>
                    <ShoppingBag />
                    <span>新增訂單</span>
                  </SidebarMenuButton>
                }
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {sidebarNav.map((group, i) => (
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
              <Link href="/">
                <LayoutGrid />
                <span>主選單</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
