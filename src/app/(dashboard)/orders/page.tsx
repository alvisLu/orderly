import { navGroups } from "@/config/nav";
import { NavGroupHub } from "@/components/shared/nav-group-hub";

export default function OrdersPage() {
  return <NavGroupHub group={navGroups["/orders"]} />;
}
