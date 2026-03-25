import { getProduct, editProduct, removeProduct } from '@/modules/products/service'
import type { UpdateProductInput } from '@/modules/products/types'

type Params = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  const { id } = await params
  try {
    const product = await getProduct(id)
    if (!product) return Response.json({ error: 'not found' }, { status: 404 })
    return Response.json(product)
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const body: UpdateProductInput = await request.json()
  try {
    const product = await editProduct(id, body)
    if (!product) return Response.json({ error: 'not found' }, { status: 404 })
    return Response.json(product)
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params
  try {
    await removeProduct(id)
    return new Response(null, { status: 204 })
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 })
  }
}
