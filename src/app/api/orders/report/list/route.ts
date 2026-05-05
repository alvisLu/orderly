import { getDailyOrderReports } from "@/modules/orders/service";
import { authRouteHandler } from "@/lib/route-handler";
import { dailyOrderReportsQueryDto } from "@/modules/orders/dto";

export const GET = authRouteHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const { from, to } = dailyOrderReportsQueryDto.parse(
    Object.fromEntries(searchParams)
  );
  const reports = await getDailyOrderReports(from, to);
  return Response.json(reports);
});
