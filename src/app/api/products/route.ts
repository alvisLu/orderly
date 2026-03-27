import { getProducts, createProduct } from "@/modules/products/service";
import { routeHandler } from "@/lib/route-handler";
import { createProductDto, productQueryDto } from "@/modules/products/dto";

export const GET = routeHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const query = productQueryDto.parse(Object.fromEntries(searchParams));
  const products = await getProducts(query);
  return Response.json(products);
});

export const POST = routeHandler(async (request) => {
  const body = createProductDto.parse(await request.json());
  const product = await createProduct(body);
  return Response.json(product, { status: 201 });
});
