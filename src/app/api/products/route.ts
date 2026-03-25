import { getProducts, createProduct } from '@/modules/products/service'
import type { CreateProductInput } from '@/modules/products/types'

export async function GET() {
  try {
    const products = await getProducts()
    return Response.json(products)
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body: Partial<CreateProductInput> = await request.json()

  if (!body.name || body.price == null) {
    return Response.json({ error: 'name and price are required' }, { status: 400 })
  }

  try {
    const product = await createProduct(body as CreateProductInput)
    return Response.json(product, { status: 201 })
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 })
  }
}
