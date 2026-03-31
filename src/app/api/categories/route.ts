import { getCategories, createCategory } from "@/modules/categories/service";
import { authRouteHandler } from "@/lib/route-handler";
import { createCategoryDto } from "@/modules/categories/dto";

export const GET = authRouteHandler(async () => {
  const categories = await getCategories();
  return Response.json(categories);
});

export const POST = authRouteHandler(async (request) => {
  const body = createCategoryDto.parse(await request.json());
  const category = await createCategory(body);
  return Response.json(category, { status: 201 });
});
