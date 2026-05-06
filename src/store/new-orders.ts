import { create } from "zustand";
import type { Order } from "@/modules/orders/types";

interface NewOrdersStore {
  batch: Order[];
  version: number;
  publish: (orders: Order[]) => void;
}

export const useNewOrdersStore = create<NewOrdersStore>((set) => ({
  batch: [],
  version: 0,
  publish: (orders) =>
    set((s) => ({ batch: orders, version: s.version + 1 })),
}));
