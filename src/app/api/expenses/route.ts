import { createExpense, getExpenses } from "@/modules/expenses/service";
import { authRouteHandler } from "@/lib/route-handler";
import { createExpenseDto, expenseQueryDto } from "@/modules/expenses/dto";

export const GET = authRouteHandler(async (request) => {
  const url = new URL(request.url);
  const query = expenseQueryDto.parse(Object.fromEntries(url.searchParams));
  const expenses = await getExpenses(query);
  return Response.json(expenses);
});

export const POST = authRouteHandler(async (request) => {
  const body = createExpenseDto.parse(await request.json());
  const expense = await createExpense(body);
  return Response.json(expense, { status: 201 });
});
