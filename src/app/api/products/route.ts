import { getProducts, createProduct } from "@/modules/products/service";
import { authRouteHandler } from "@/lib/route-handler";
import { createProductDto, productQueryDto } from "@/modules/products/dto";

export const GET = authRouteHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const query = productQueryDto.parse(Object.fromEntries(searchParams));
  const products = await getProducts(query);
  return Response.json(products);
});

export const POST = authRouteHandler(async (request) => {
  const body = createProductDto.parse(await request.json());
  const product = await createProduct(body);
  return Response.json(product, { status: 201 });
});
