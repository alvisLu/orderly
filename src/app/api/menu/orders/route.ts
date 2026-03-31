import { createOrder } from "@/modules/orders/service";
import { routeHandler } from "@/lib/route-handler";
import { createOrderDto } from "@/modules/orders/dto";

export const POST = routeHandler(async (request) => {
  const body = createOrderDto.parse(await request.json());
  const order = await createOrder(body);
  return Response.json(order, { status: 201 });
});
