import { createClient } from "@/lib/supabase/server";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./types";
import { DatabaseError } from "@/lib/http-error";

export async function findAllCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select()
    .order("rank", { ascending: true });
  if (error) throw new DatabaseError(error.message);
  return data;
}

export async function findCategoryById(id: string): Promise<Category | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select()
    .eq("id", id)
    .maybeSingle();
  if (error) throw new DatabaseError(error.message);
  return data;
}

export async function findCategoryByName(
  name: string
): Promise<Category | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select()
    .eq("name", name)
    .maybeSingle();
  if (error) throw new DatabaseError(error.message);
  return data;
}

export async function findCategoryByIds(ids: string[]): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select()
    .in("id", ids);
  if (error) throw new DatabaseError(error.message);
  return data;
}

export async function insertCategory(
  input: CreateCategoryInput
): Promise<Category> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert(input)
    .select()
    .single();
  if (error) throw new DatabaseError(error.message);
  return data;
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput
): Promise<Category | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .update(input)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw new DatabaseError(error.message);
  return data;
}

export async function updateCategoryRankBy(
  id: string,
  rank: number
): Promise<Category | null> {
  return updateCategory(id, { rank });
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new DatabaseError(error.message);
}
