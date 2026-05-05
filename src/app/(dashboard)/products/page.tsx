import { navGroups } from "@/config/nav";
import { NavGroupHub } from "@/components/shared/nav-group-hub";

export default function ProductsPage() {
  return <NavGroupHub group={navGroups["/products"]} />;
}
