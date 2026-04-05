import { StoreNotFoundError } from "@/lib/http-error";
import { findFirstStore, updateStore } from "./repository";
import type { Store, UpdateStoreInput } from "./types";

export async function getStore(): Promise<Store> {
  const store = await findFirstStore();
  if (!store) throw new StoreNotFoundError();
  return store;
}

export async function editStore(
  id: string,
  input: UpdateStoreInput
): Promise<Store> {
  const existing = await findFirstStore();
  if (!existing) throw new StoreNotFoundError();
  const store = await updateStore(id, input);
  if (!store) throw new StoreNotFoundError();
  return store;
}
