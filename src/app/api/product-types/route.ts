import { getProductTypes, createProductType } from "@/modules/product-types/service";
import { routeHandler } from "@/lib/route-handler";
import { createProductTypeDto } from "@/modules/product-types/dto";

export const GET = routeHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId") ?? undefined;
  const productTypes = await getProductTypes(productId);
  return Response.json(productTypes);
});

export const POST = routeHandler(async (request) => {
  const body = createProductTypeDto.parse(await request.json());
  const productType = await createProductType(body);
  return Response.json(productType, { status: 201 });
});
