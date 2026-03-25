export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  cost: number
  image_urls: string[]
  is_favorite: boolean
  is_pos_available: boolean
  is_menu_available: boolean
}

export type CreateProductInput = Omit<Product, 'id'>
export type UpdateProductInput = Partial<CreateProductInput>
