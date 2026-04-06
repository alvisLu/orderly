import { Badge } from "@/components/ui/badge";

export function DiningBadge({ isDining }: { isDining: boolean }) {
  return <Badge variant="outline">{isDining ? "用餐中" : "已離場"}</Badge>;
}
