import { prisma } from "@/lib/prisma";
import { MenuClient } from "./online";

interface Props {
  searchParams: Promise<{ t?: string }>;
}

export default async function MenuPage({ searchParams }: Props) {
  const { t } = await searchParams;

  if (!t) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">請掃描桌上的 QR Code 點餐</p>
      </div>
    );
  }

  const [table, store, products] = await Promise.all([
    prisma.table.findFirst({ where: { name: t, isActive: true } }),
    prisma.store.findFirst(),
    prisma.product.findMany({
      where: { isMenuAvailable: true },
      orderBy: { name: "asc" },
      include: {
        category: true,
        productTypes: { include: { productType: true } },
      },
    }),
  ]);

  if (!table) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">桌號不存在或已停用</p>
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
