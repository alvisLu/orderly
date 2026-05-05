import { getDailyGatewayStats } from "@/modules/orders/service";
import { authRouteHandler } from "@/lib/route-handler";
import { dailyGatewayStatsQueryDto } from "@/modules/orders/dto";

export const GET = authRouteHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const query = dailyGatewayStatsQueryDto.parse(
    Object.fromEntries(searchParams)
  );
  const stats = await getDailyGatewayStats(query);
  return Response.json(stats);
});
