import { appendOrderItems } from "@/modules/orders/service";
import { authRouteHandler } from "@/lib/route-handler";
import { appendOrderItemsDto } from "@/modules/orders/dto";

type Params = { params: Promise<{ id: string }> };

export const POST = authRouteHandler(async (request, { params }) => {
  const { id } = await (params as Params["params"]);
  const { items } = appendOrderItemsDto.parse(await request.json());
  const order = await appendOrderItems(id, items);
  return Response.json(order);
});
