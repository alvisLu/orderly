import {
  getOrdersReport,
  regenerateOrderReports,
} from "@/modules/orders/service";
import { authRouteHandler } from "@/lib/route-handler";
import {
  dailyReportBucketsDto,
  ordersReportQueryDto,
} from "@/modules/orders/dto";

export const GET = authRouteHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const query = ordersReportQueryDto.parse(Object.fromEntries(searchParams));
  const report = await getOrdersReport(query);
  return Response.json(report);
});

export const POST = authRouteHandler(async (request) => {
  const { buckets } = dailyReportBucketsDto.parse(await request.json());
  const reports = await regenerateOrderReports(buckets);
  return Response.json(reports);
});
