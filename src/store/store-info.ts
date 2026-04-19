import { create } from "zustand";
import type { Store } from "@/modules/stores/types";

interface StoreInfoStore {
  store: Store | null;
  setStore: (store: Store) => void;
  clearStore: () => void;
}

export const useStoreInfo = create<StoreInfoStore>()((set) => ({
  store: null,
  setStore: (store) => set({ store }),
  clearStore: () => set({ store: null }),
}));
