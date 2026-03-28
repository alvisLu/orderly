import { getProductType, editProductType, removeProductType } from "@/modules/product-types/service";
import { routeHandler } from "@/lib/route-handler";
import { updateProductTypeDto } from "@/modules/product-types/dto";

type Params = { params: Promise<{ id: string }> };

export const GET = routeHandler(async (_, { params }) => {
  const { id } = await (params as Params["params"]);
  const productType = await getProductType(id);
  return Response.json(productType);
});

export const PATCH = routeHandler(async (request, { params }) => {
  const { id } = await (params as Params["params"]);
  const body = updateProductTypeDto.parse(await request.json());
  const productType = await editProductType(id, body);
  return Response.json(productType);
});

export const DELETE = routeHandler(async (_, { params }) => {
  const { id } = await (params as Params["params"]);
  await removeProductType(id);
  return new Response(null, { status: 204 });
});
