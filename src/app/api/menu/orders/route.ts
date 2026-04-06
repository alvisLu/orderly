import { createOrder, getOrdersByIds } from "@/modules/orders/service";
import { routeHandler } from "@/lib/route-handler";
import { createOrderDto } from "@/modules/orders/dto";

export const GET = routeHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids");
  if (!ids) {
    return Response.json({ error: "缺少訂單 ID" }, { status: 400 });
  }
  const orderIds = ids.split(",").filter(Boolean);
  if (orderIds.length === 0) {
    return Response.json([]);
  }
  const orders = await getOrdersByIds(orderIds);
  return Response.json(orders);
});

export const POST = routeHandler(async (request) => {
  const body = createOrderDto.parse(await request.json());
  const order = await createOrder(body);
  return Response.json(order, { status: 201 });
});
