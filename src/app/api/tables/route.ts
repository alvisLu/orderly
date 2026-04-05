import { getTables, createTable } from "@/modules/tables/service";
import { authRouteHandler } from "@/lib/route-handler";
import { createTableDto, tableQueryDto } from "@/modules/tables/dto";

export const GET = authRouteHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const query = tableQueryDto.parse(Object.fromEntries(searchParams));
  const tables = await getTables(query);
  return Response.json(tables);
});

export const POST = authRouteHandler(async (request) => {
  const body = createTableDto.parse(await request.json());
  const table = await createTable(body);
  return Response.json(table, { status: 201 });
});
