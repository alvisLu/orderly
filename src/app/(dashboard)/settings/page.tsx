import Link from "next/link";
import { Store, TableProperties, WalletCards } from "lucide-react";
import {
  Stat,
  StatIndicator,
  StatLabel,
  StatValue,
} from "@/components/ui/stat";

const cards = [
  {
    title: "店家資料",
    label: "商店",
    href: "/settings/stores/profile",
    icon: Store,
    color: "bg-primary text-primary-foreground",
  },
  {
    title: "桌位管理",
    label: "桌位",
    href: "/settings/tables",
    icon: TableProperties,
    color: "bg-secondary text-secondary-foreground",
  },
  {
    title: "付款管理",
    label: "付款",
    href: "/settings/payments",
    icon: WalletCards,
    color: "bg-muted-foreground text-white",
  },
];

export default function SettingsPage() {
  return (
    <div className="flex h-full flex-col items-center overflow-auto px-4 py-8">
      <h1 className="text-3xl font-bold">設定</h1>
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
