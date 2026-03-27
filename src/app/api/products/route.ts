import { getProducts, createProduct } from "@/modules/products/service";
import type {
  CreateProductInput,
  ProductQuery,
} from "@/modules/products/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query: ProductQuery = {
    search: searchParams.get("search") ?? undefined,
    is_favorite: searchParams.get("is_favorite") === "true" ? true : undefined,
    sort_by: (searchParams.get("sort_by") === "name"
      ? "name"
      : "created_at") as ProductQuery["sort_by"],
    sort_order: (searchParams.get("sort_order") === "desc"
      ? "desc"
      : "asc") as ProductQuery["sort_order"],
  };
  try {
    const products = await getProducts(query);
    return Response.json(products);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body: Partial<CreateProductInput> = await request.json();

  if (!body.name || body.price == null) {
    return Response.json(
      { error: "name and price are required" },
      { status: 400 }
    );
  }

  try {
    const product = await createProduct(body as CreateProductInput);
    return Response.json(product, { status: 201 });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
