import Link from "next/link";
import { ClipboardList, ConciergeBell } from "lucide-react";
import {
  Stat,
  StatIndicator,
  StatLabel,
  StatValue,
} from "@/components/ui/stat";

const cards = [
  {
    title: "處理中訂單",
    label: "訂單",
    href: "/orders/restaurant",
    icon: ConciergeBell,
    color: "bg-primary text-primary-foreground",
  },
  {
    title: "訂單列表",
    label: "訂單",
    href: "/orders/list",
    icon: ClipboardList,
    color: "bg-secondary text-secondary-foreground",
  },
];

export default function OrdersPage() {
  return (
    <div className="flex h-full flex-col items-center overflow-auto px-4 py-8">
      <h1 className="text-3xl font-bold">訂單管理</h1>
      <div className="mt-8 grid w-full max-w-3xl grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Stat className="cursor-pointer transition-colors hover:bg-accent">
              <StatLabel>{card.label}</StatLabel>
              <StatValue className="text-3xl">{card.title}</StatValue>
              <StatIndicator variant="icon" className={card.color}>
                <card.icon />
              </StatIndicator>
            </Stat>
          </Link>
        ))}
      </div>
    </div>
  );
}
