import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { findFirstStore } from "@/modules/stores/repository";
import { isStoreOpen } from "@/modules/stores/hours";
import { MenuClient } from "./online";
import { StoreClosed } from "./components/store-closed";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ t?: string }>;
}

export default async function MenuPage({ searchParams }: Props) {
  const { t } = await searchParams;

  const [table, store, products] = await Promise.all([
    t ? prisma.table.findFirst({ where: { name: t, isActive: true } }) : null,
    findFirstStore(),
    prisma.product.findMany({
      where: { isMenuAvailable: true },
      orderBy: { name: "asc" },
      include: {
        category: true,
        productTypes: { include: { productType: true } },
      },
    }),
  ]);

  const isClosed =
    store &&
    (store.onlineOrdering === "disabled" ||
      (store.onlineOrdering === "auto" && !isStoreOpen(store.opening)));

  if (isClosed) {
    return (
      <StoreClosed
        store={{
          name: store.name,
          phone: store.phone ?? undefined,
          address: store.address ?? undefined,
          bannerUrl: store.bannerURL ?? undefined,
          opening: store.opening,
        }}
      />
    );
  }

  if (!table) {
    const tables = await prisma.table.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6">
        <p className="text-xl font-semibold text-primary">請選擇桌號</p>
        {tables.length === 0 ? (
          <p className="text-muted-foreground">目前沒有可用桌號</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 w-full max-w-md">
            {tables.map((item) => (
              <Button key={item.id} asChild size="xl" className="w-full">
                <Link href={`/menu?t=${encodeURIComponent(item.name)}`}>
                  {item.name}
                </Link>
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const serialized = JSON.parse(JSON.stringify(products));

  return (
    <MenuClient
      tableName={table.name}
      products={serialized}
      store={
        store
          ? {
              name: store.name,
              phone: store.phone ?? undefined,
              address: store.address ?? undefined,
              bannerUrl: store.bannerURL ?? undefined,
            }
          : undefined
      }
    />
  );
}
