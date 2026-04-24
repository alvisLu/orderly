import { getOrderStats } from "@/modules/orders/service";
import { authRouteHandler } from "@/lib/route-handler";
import { orderStatsQueryDto } from "@/modules/orders/dto";

export const GET = authRouteHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const query = orderStatsQueryDto.parse(Object.fromEntries(searchParams));
  const stats = await getOrderStats(query);
  return Response.json(stats);
});
