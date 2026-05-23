import { getCheckoutTransactions } from "@/modules/orders/service";
import { authRouteHandler } from "@/lib/route-handler";
import { checkoutTransactionsQueryDto } from "@/modules/orders/dto";

export const GET = authRouteHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const query = checkoutTransactionsQueryDto.parse(
    Object.fromEntries(searchParams)
  );
  const transactions = await getCheckoutTransactions(query);
  return Response.json(transactions);
});
