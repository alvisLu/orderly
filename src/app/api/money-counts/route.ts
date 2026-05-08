import {
  createMoneyCount,
  getMoneyCounts,
} from "@/modules/money-counts/service";
import { authRouteHandler } from "@/lib/route-handler";
import {
  createMoneyCountDto,
  moneyCountQueryDto,
} from "@/modules/money-counts/dto";

export const GET = authRouteHandler(async (request) => {
  const url = new URL(request.url);
  const query = moneyCountQueryDto.parse(Object.fromEntries(url.searchParams));
  const moneyCounts = await getMoneyCounts(query);
  return Response.json(moneyCounts);
});

export const POST = authRouteHandler(async (request) => {
  const body = createMoneyCountDto.parse(await request.json());
  const moneyCount = await createMoneyCount(body);
  return Response.json(moneyCount, { status: 201 });
});
