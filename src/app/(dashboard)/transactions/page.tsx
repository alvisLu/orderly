import { navGroups } from "@/config/nav";
import { NavGroupHub } from "@/components/shared/nav-group-hub";

export default function TransactionsPage() {
  return <NavGroupHub group={navGroups["/transactions"]} />;
}
