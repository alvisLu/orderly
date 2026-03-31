import {
  getProductTypes,
  createProductType,
} from "@/modules/product-types/service";
import { authRouteHandler } from "@/lib/route-handler";
import {
  createProductTypeDto,
  productTypeQueryDto,
} from "@/modules/product-types/dto";

export const GET = authRouteHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const query = productTypeQueryDto.parse(Object.fromEntries(searchParams));
  const productTypes = await getProductTypes(query);
  return Response.json(productTypes);
});

export const POST = authRouteHandler(async (request) => {
  const body = createProductTypeDto.parse(await request.json());
  const productType = await createProductType(body);
  return Response.json(productType, { status: 201 });
});
