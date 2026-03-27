import { getCategories, createCategory } from "@/modules/categories/service";
import { routeHandler } from "@/lib/route-handler";
import { createCategoryDto } from "@/modules/categories/dto";

export const GET = routeHandler(async () => {
  const categories = await getCategories();
  return Response.json(categories);
});

export const POST = routeHandler(async (request) => {
  const body = createCategoryDto.parse(await request.json());
  const category = await createCategory(body);
  return Response.json(category, { status: 201 });
});

