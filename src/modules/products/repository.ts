import { createClient } from '@/lib/supabase/server';
import type { CreateProductInput, Product, ProductQuery, UpdateProductInput } from './types';

export async function findAllProducts(query: ProductQuery = {}): Promise<Product[]> {
  const supabase = createClient();
  const { search, is_favorite, sort_by = 'created_at', sort_order = 'asc' } = query;

  let q = supabase.from('products').select();

  if (search) {
    q = q.ilike('name', `%${search}%`);
  }
  if (is_favorite !== undefined) {
    q = q.eq('is_favorite', is_favorite);
  }

  q = q.order(sort_by, { ascending: sort_order === 'asc' });

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data;
}

export async function findProductById(id: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select()
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function insertProduct(
  input: CreateProductInput,
): Promise<Product> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .update(input)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
