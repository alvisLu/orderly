import { navGroups } from "@/config/nav";
import { NavGroupHub } from "@/components/shared/nav-group-hub";

export default function ReportsPage() {
  return <NavGroupHub group={navGroups["/reports"]} />;
}
