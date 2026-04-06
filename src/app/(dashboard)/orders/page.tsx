import Link from "next/link";
import { navGroups } from "@/config/nav";
import {
  Stat,
  StatIndicator,
  StatLabel,
  StatValue,
} from "@/components/ui/stat";

const group = navGroups["/orders"];

export default function OrdersPage() {
  return (
    <div className="flex h-full flex-col items-center overflow-auto px-4 py-8">
      <h1 className="text-3xl font-bold">{group.label}</h1>
      <div className="mt-8 grid w-full max-w-3xl grid-cols-3 gap-4">
        {group.sub.map((card) => {
          const Icon = card.icon ?? group.icon;
          return (
            <Link key={card.title} href={card.url}>
              <Stat className="cursor-pointer transition-colors hover:bg-accent">
                <StatLabel>{group.label}</StatLabel>
                <StatValue className="text-3xl">{card.title}</StatValue>
                <StatIndicator
                  variant="icon"
                  className={`${group.color} text-white`}
                >
                  <Icon />
                </StatIndicator>
              </Stat>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
