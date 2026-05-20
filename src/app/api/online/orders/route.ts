import { createOnlineOrder } from "@/modules/orders/service";
import { routeHandler } from "@/lib/route-handler";
import { createOnlineOrderDto } from "@/modules/orders/dto";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

export const POST = routeHandler(async (request) => {
  await enforceRateLimit(getClientIp(request), {
    scope: "online-order",
    limit: 10,
    windowSeconds: 60,
  });
  const body = createOnlineOrderDto.parse(await request.json());
  const order = await createOnlineOrder(body);
  return Response.json(order, { status: 201 });
});
