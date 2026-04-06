import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { OrderNotifications } from "@/components/shared/order-notifications";
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 flex flex-col h-dvh overflow-hidden">
        <header className="flex items-center h-12 shrink-0 px-4">
          <DashboardBreadcrumb />
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <OrderNotifications />
    </SidebarProvider>
  );
}
