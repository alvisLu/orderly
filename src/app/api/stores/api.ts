import apiClient from "@/lib/api-client";
import type { Store, UpdateStoreInput } from "@/modules/stores/types";

export async function apiGetStore(): Promise<Store> {
  const { data } = await apiClient.get<Store>("/stores");
  return data;
}

export async function apiUpdateStore(input: UpdateStoreInput): Promise<Store> {
  const { data } = await apiClient.patch<Store>("/stores", input);
  return data;
}
