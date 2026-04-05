import {
  getTable,
  editTable,
  removeTable,
} from "@/modules/tables/service";
import { authRouteHandler } from "@/lib/route-handler";
import { updateTableDto } from "@/modules/tables/dto";

type Params = { params: Promise<{ id: string }> };

export const GET = authRouteHandler(async (_, { params }) => {
  const { id } = await (params as Params["params"]);
  const table = await getTable(id);
  return Response.json(table);
});

export const PATCH = authRouteHandler(async (request, { params }) => {
  const { id } = await (params as Params["params"]);
  const body = updateTableDto.parse(await request.json());
  const table = await editTable(id, body);
  return Response.json(table);
});

export const DELETE = authRouteHandler(async (_, { params }) => {
  const { id } = await (params as Params["params"]);
  await removeTable(id);
  return new Response(null, { status: 204 });
});
