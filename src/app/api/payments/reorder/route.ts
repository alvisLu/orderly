import { reorderPayments } from "@/modules/payments/service";
import { routeHandler } from "@/lib/route-handler";
import { reorderPaymentsDto } from "@/modules/payments/dto";

export const POST = routeHandler(async (request) => {
  const { payments } = reorderPaymentsDto.parse(await request.json());
  await reorderPayments(payments);
  return new Response(null, { status: 204 });
});
