"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { navGroups, type NavGroup } from "@/config/nav";
import { Stat, StatIndicator, StatLabel, StatValue } from "@/components/ui/stat";

function GroupItems({
  group,
  onBack,
}: {
  group: NavGroup;
  onBack: () => void;
}) {
  const cards = group.items.flatMap((item) =>
    item.sub
      ? item.sub.map((sub) => ({
          title: sub.title,
          href: sub.url,
          icon: sub.icon ?? item.icon,
        }))
      : [{ title: item.title, href: item.url!, icon: item.icon }]
  );

  return (
    <div className="flex h-full flex-col items-center overflow-auto px-4 py-8">
      <div className="flex w-full max-w-3xl items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          主選單
        </button>
      </div>

      <h1 className="mt-4 text-3xl font-bold">{group.label}</h1>

      <div className="mt-8 grid w-full max-w-3xl grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Stat className="cursor-pointer transition-colors hover:bg-accent">
              <StatLabel>{group.label}</StatLabel>
              <StatValue className="text-3xl">{card.title}</StatValue>
              <StatIndicator variant="icon" className={`${group.color} text-white`}>
                <card.icon />
              </StatIndicator>
            </Stat>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (selectedIndex !== null) {
    const group = navGroups[selectedIndex];
    return (
      <GroupItems
        group={group}
        onBack={() => setSelectedIndex(null)}
      />
    );
  }

  return (
    <div className="flex h-full flex-col items-center overflow-auto px-4 py-8">
      <h1 className="text-3xl font-bold">主選單</h1>

      <div className="mt-8 grid w-full max-w-3xl grid-cols-3 gap-4">
        {navGroups.map((group, i) => (
          <Stat
            key={group.label}
            className="cursor-pointer transition-colors hover:bg-accent"
            onClick={() => setSelectedIndex(i)}
          >
            <StatLabel>分類</StatLabel>
            <StatValue className="text-3xl">{group.label}</StatValue>
            <StatIndicator variant="icon" className={`${group.color} text-white`}>
              {(() => {
                const Icon = group.items[0]?.icon;
                return Icon ? <Icon /> : null;
              })()}
            </StatIndicator>
          </Stat>
        ))}
      </div>
    </div>
  );
}
