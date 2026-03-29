import { getPayments, createPayment } from "@/modules/payments/service";
import { routeHandler } from "@/lib/route-handler";
import { createPaymentDto } from "@/modules/payments/dto";

export const GET = routeHandler(async () => {
  const payments = await getPayments();
  return Response.json(payments);
});

export const POST = routeHandler(async (request) => {
  const body = createPaymentDto.parse(await request.json());
  const payment = await createPayment(body);
  return Response.json(payment, { status: 201 });
});
