import { navGroups } from "@/config/nav";
import { NavGroupHub } from "@/components/shared/nav-group-hub";

export default function SettingsPage() {
  return <NavGroupHub group={navGroups["/settings"]} />;
}
