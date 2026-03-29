import { getPayment, editPayment, removePayment } from "@/modules/payments/service";
import { routeHandler } from "@/lib/route-handler";
import { updatePaymentDto } from "@/modules/payments/dto";

type Params = { params: Promise<{ id: string }> };

export const GET = routeHandler(async (_, { params }) => {
  const { id } = await (params as Params["params"]);
  const payment = await getPayment(id);
  return Response.json(payment);
});

export const PATCH = routeHandler(async (request, { params }) => {
  const { id } = await (params as Params["params"]);
  const body = updatePaymentDto.parse(await request.json());
  const payment = await editPayment(id, body);
  return Response.json(payment);
});

export const DELETE = routeHandler(async (_, { params }) => {
  const { id } = await (params as Params["params"]);
  await removePayment(id);
  return new Response(null, { status: 204 });
});
