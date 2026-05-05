import { getOrdersReport } from "@/modules/orders/service";
import { authRouteHandler } from "@/lib/route-handler";
import { ordersReportQueryDto } from "@/modules/orders/dto";

export const GET = authRouteHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const query = ordersReportQueryDto.parse(Object.fromEntries(searchParams));
  const report = await getOrdersReport(query);
  return Response.json(report);
});
