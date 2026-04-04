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

  const table = await prisma.table.findFirst({
    where: { name: t, isActive: true },
  });

  if (!table) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">桌號不存在或已停用</p>
      </div>
    );
  }

  const products = await prisma.product.findMany({
    where: { isMenuAvailable: true },
    orderBy: { name: "asc" },
    include: {
      category: true,
      productTypes: { include: { productType: true } },
    },
  });

  const serialized = JSON.parse(JSON.stringify(products));

  return (
    <MenuClient
      tableName={table.name}
      products={serialized}
      store={{
        name: "羊肉盧-麵食堂-",
        phone: "0982724358",
        address: "花蓮市府前路396號",
        description: "點餐說明",
        businessHours: [
          { day: "週日", hours: "未營業" },
          { day: "週一", hours: "11:00-14:00, 16:30-20:00" },
          { day: "週二", hours: "11:00-14:00, 16:30-20:00" },
          { day: "週三", hours: "11:00-14:00, 16:30-20:00" },
          { day: "週四", hours: "11:00-14:00, 16:30-20:00" },
          { day: "週五", hours: "11:00-14:00, 16:00-20:00" },
          { day: "週六", hours: "11:00-14:00, 16:30-20:00" },
        ],
      }}
    />
  );
}
