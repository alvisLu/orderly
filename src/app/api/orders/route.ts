import { getOrders, createOrder } from "@/modules/orders/service";
import { authRouteHandler } from "@/lib/route-handler";
import { createOrderDto, orderQueryDto } from "@/modules/orders/dto";

export const GET = authRouteHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const query = orderQueryDto.parse(Object.fromEntries(searchParams));
  const orders = await getOrders(query);
  return Response.json(orders);
});

export const POST = authRouteHandler(async (request) => {
  const body = createOrderDto.parse(await request.json());
  const order = await createOrder(body);
  return Response.json(order, { status: 201 });
});
