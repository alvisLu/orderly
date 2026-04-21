import {
  editExpense,
  getExpense,
  removeExpense,
} from "@/modules/expenses/service";
import { authRouteHandler } from "@/lib/route-handler";
import { updateExpenseDto } from "@/modules/expenses/dto";

type Params = { params: Promise<{ id: string }> };

export const GET = authRouteHandler(async (_, { params }) => {
  const { id } = await (params as Params["params"]);
  const expense = await getExpense(id);
  return Response.json(expense);
});

export const PATCH = authRouteHandler(async (request, { params }) => {
  const { id } = await (params as Params["params"]);
  const body = updateExpenseDto.parse(await request.json());
  const expense = await editExpense(id, body);
  return Response.json(expense);
});

export const DELETE = authRouteHandler(async (_, { params }) => {
  const { id } = await (params as Params["params"]);
  await removeExpense(id);
  return new Response(null, { status: 204 });
});
