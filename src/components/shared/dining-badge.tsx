import { Badge } from "@/components/ui/badge";

export function DiningBadge({ isDining }: { isDining: boolean }) {
  const variant = isDining ? "third" : "outline";
  return <Badge variant={variant}>{isDining ? "用餐中" : "已離場"}</Badge>;
}
