import { getCategory, editCategory, removeCategory } from "@/modules/categories/service";
import { routeHandler } from "@/lib/route-handler";
import { updateCategoryDto } from "@/modules/categories/dto";

type Params = { params: Promise<{ id: string }> };

export const GET = routeHandler(async (_, { params }) => {
  const { id } = await (params as Params["params"]);
  const category = await getCategory(id);
  return Response.json(category);
});

export const PATCH = routeHandler(async (request, { params }) => {
  const { id } = await (params as Params["params"]);
  const body = updateCategoryDto.parse(await request.json());
  const category = await editCategory(id, body);
  return Response.json(category);
});

export const DELETE = routeHandler(async (_, { params }) => {
  const { id } = await (params as Params["params"]);
  await removeCategory(id);
  return new Response(null, { status: 204 });
});
