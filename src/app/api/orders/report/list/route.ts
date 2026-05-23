import { getDailyOrderReports } from "@/modules/orders/service";
import { authRouteHandler } from "@/lib/route-handler";
import { dailyReportBucketsDto } from "@/modules/orders/dto";

export const POST = authRouteHandler(async (request) => {
  const { buckets } = dailyReportBucketsDto.parse(await request.json());
  const reports = await getDailyOrderReports(buckets);
  return Response.json(reports);
});
