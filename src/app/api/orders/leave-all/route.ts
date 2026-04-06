import { leaveAllDining } from "@/modules/orders/service";
import { authRouteHandler } from "@/lib/route-handler";

export const POST = authRouteHandler(async () => {
  const count = await leaveAllDining();
  return Response.json({ count });
});
