import { getOrders } from "@/modules/orders/service";
import { authRouteHandler } from "@/lib/route-handler";
import { orderPollQueryDto } from "@/modules/orders/dto";

export const GET = authRouteHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const { from } = orderPollQueryDto.parse(Object.fromEntries(searchParams));
  const orders = await getOrders({
    from,
    sort: "desc",
    page: 1,
    limit: 10,
  });
  return Response.json(orders);
});
