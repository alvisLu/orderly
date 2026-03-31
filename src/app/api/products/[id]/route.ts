import {
  getProduct,
  editProduct,
  removeProduct,
} from "@/modules/products/service";
import { authRouteHandler } from "@/lib/route-handler";
import { updateProductDto } from "@/modules/products/dto";

type Params = { params: Promise<{ id: string }> };

export const GET = authRouteHandler(async (_, { params }) => {
  const { id } = await (params as Params["params"]);
  const product = await getProduct(id);
  return Response.json(product);
});

export const PATCH = authRouteHandler(async (request, { params }) => {
  const { id } = await (params as Params["params"]);
  const body = updateProductDto.parse(await request.json());
  const product = await editProduct(id, body);
  return Response.json(product);
});

export const DELETE = authRouteHandler(async (_, { params }) => {
  const { id } = await (params as Params["params"]);
  await removeProduct(id);
  return new Response(null, { status: 204 });
});
