import {
  getMoneyCount,
  removeMoneyCount,
} from "@/modules/money-counts/service";
import { authRouteHandler } from "@/lib/route-handler";

type Params = { params: Promise<{ id: string }> };

export const GET = authRouteHandler(async (_, { params }) => {
  const { id } = await (params as Params["params"]);
  const moneyCount = await getMoneyCount(id);
  return Response.json(moneyCount);
});

export const DELETE = authRouteHandler(async (_, { params }) => {
  const { id } = await (params as Params["params"]);
  await removeMoneyCount(id);
  return new Response(null, { status: 204 });
});
