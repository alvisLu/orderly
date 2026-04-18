import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Store } from "@/modules/stores/types";

interface StoreInfoStore {
  store: Store | null;
  setStore: (store: Store) => void;
}

export const useStoreInfo = create<StoreInfoStore>()(
  persist(
    (set) => ({
      store: null,
      setStore: (store) => set({ store }),
    }),
    { name: "store-info" }
  )
);
