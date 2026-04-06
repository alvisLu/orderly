import Link from "next/link";
import { ClipboardList, FolderTree, Settings2 } from "lucide-react";
import {
  Stat,
  StatIndicator,
  StatLabel,
  StatValue,
} from "@/components/ui/stat";

const cards = [
  {
    title: "商品列表",
    label: "商品",
    href: "/products/list",
    icon: ClipboardList,
    color: "bg-primary text-primary-foreground",
  },
  {
    title: "目錄管理",
    label: "分類",
    href: "/products/categories",
    icon: FolderTree,
    color: "bg-secondary text-secondary-foreground",
  },
  {
    title: "商品選項",
    label: "選項",
    href: "/products/types",
    icon: Settings2,
    color: "bg-muted-foreground text-white",
  },
];

export default function ProductsPage() {
  return (
    <div className="flex h-full flex-col items-center overflow-auto px-4 py-8">
      <h1 className="text-3xl font-bold">商品管理</h1>
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
