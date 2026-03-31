import { reorderCategories } from "@/modules/categories/service";
import { authRouteHandler } from "@/lib/route-handler";
import { reorderCategoriesDto } from "@/modules/categories/dto";

export const POST = authRouteHandler(async (request) => {
  const { categories } = reorderCategoriesDto.parse(await request.json());
  await reorderCategories(categories);
  return new Response(null, { status: 204 });
});
