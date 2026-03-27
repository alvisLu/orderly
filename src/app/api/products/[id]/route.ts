import {
  getProduct,
  editProduct,
  removeProduct,
} from "@/modules/products/service";
import { routeHandler } from "@/lib/route-handler";
import { updateProductDto } from "@/modules/products/dto";

type Params = { params: Promise<{ id: string }> };

export const GET = routeHandler(async (_, { params }) => {
  const { id } = await (params as Params["params"]);
  const product = await getProduct(id);
  return Response.json(product);
});

export const PATCH = routeHandler(async (request, { params }) => {
  const { id } = await (params as Params["params"]);
  const body = updateProductDto.parse(await request.json());
  const product = await editProduct(id, body);
  return Response.json(product);
});

export const DELETE = routeHandler(async (_, { params }) => {
  const { id } = await (params as Params["params"]);
  await removeProduct(id);
  return new Response(null, { status: 204 });
});
