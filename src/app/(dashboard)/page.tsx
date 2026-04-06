import Link from "next/link";
import { navGroups } from "@/config/nav";
import {
  Stat,
  StatIndicator,
  StatLabel,
  StatValue,
} from "@/components/ui/stat";

const cards = Object.entries(navGroups).map(([href, group]) => ({
  title: group.label,
  href,
  icon: group.icon,
  color: group.color,
}));

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col items-center overflow-auto px-4 py-8">
      <h1 className="text-3xl font-bold">主選單</h1>
      <div className="mt-8 grid w-full max-w-3xl grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Stat className="cursor-pointer transition-colors hover:bg-accent">
              <StatLabel>{card.title}</StatLabel>
              <StatValue className="text-3xl">{card.title}</StatValue>
              <StatIndicator
                variant="icon"
                className={`${card.color} text-white`}
              >
                <card.icon />
              </StatIndicator>
            </Stat>
          </Link>
        ))}
      </div>
    </div>
  );
}
