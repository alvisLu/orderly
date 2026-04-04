import { prisma } from "@/lib/prisma";
import { routeHandler } from "@/lib/route-handler";

export const GET = routeHandler(async () => {
  const products = await prisma.product.findMany({
    where: { isMenuAvailable: true },
    orderBy: { name: "asc" },
    include: {
      category: true,
      productTypes: { include: { productType: true } },
    },
  });
  return Response.json(products);
});
