import { create } from "zustand";

export type RealtimeStatus = "connecting" | "connected" | "error" | "closed";

interface RealtimeStatusStore {
  status: RealtimeStatus;
  setStatus: (status: RealtimeStatus) => void;
}

export const useRealtimeStatus = create<RealtimeStatusStore>((set) => ({
  status: "connecting",
  setStatus: (status) => set({ status }),
}));
