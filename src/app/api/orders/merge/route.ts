import { mergeOrders } from "@/modules/orders/service";
import { authRouteHandler } from "@/lib/route-handler";
import { mergeOrdersDto } from "@/modules/orders/dto";

export const POST = authRouteHandler(async (request) => {
  const { primaryId, secondaryIds } = mergeOrdersDto.parse(await request.json());
  const order = await mergeOrders(primaryId, secondaryIds);
  return Response.json(order);
});
