import { getOrder, editOrder, removeOrder } from "@/modules/orders/service";
import { authRouteHandler } from "@/lib/route-handler";
import { updateOrderDto } from "@/modules/orders/dto";

type Params = { params: Promise<{ id: string }> };

export const GET = authRouteHandler(async (_, { params }) => {
  const { id } = await (params as Params["params"]);
  const order = await getOrder(id);
  return Response.json(order);
});

export const PATCH = authRouteHandler(async (request, { params }) => {
  const { id } = await (params as Params["params"]);
  const body = updateOrderDto.parse(await request.json());
  const order = await editOrder(id, body);
  return Response.json(order);
});

export const DELETE = authRouteHandler(async (_, { params }) => {
  const { id } = await (params as Params["params"]);
  await removeOrder(id);
  return new Response(null, { status: 204 });
});
