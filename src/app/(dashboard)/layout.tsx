import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { OrderNotifications } from "@/components/shared/order-notifications";
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb";
import { RefreshButton } from "@/components/refresh-button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <div className="flex-1 flex flex-col h-dvh overflow-hidden">
        <header className="flex items-center justify-between h-12 shrink-0 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <DashboardBreadcrumb />
          </div>
          <RefreshButton />
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <OrderNotifications />
    </SidebarProvider>
  );
}
