import { createOnlineOrder } from "@/modules/orders/service";
import { routeHandler } from "@/lib/route-handler";
import { createOnlineOrderDto } from "@/modules/orders/dto";

export const POST = routeHandler(async (request) => {
  const body = createOnlineOrderDto.parse(await request.json());
  const order = await createOnlineOrder(body);
  return Response.json(order, { status: 201 });
});
