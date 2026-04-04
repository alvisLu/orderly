import { create } from "zustand";

export type RealtimeStatus = "connecting" | "connected" | "error" | "closed";

interface RealtimeStatusStore {
  status: RealtimeStatus;
  retryCount: number;
  setStatus: (status: RealtimeStatus) => void;
  setRetryCount: (count: number) => void;
}

export const useRealtimeStatus = create<RealtimeStatusStore>((set) => ({
  status: "connecting",
  retryCount: 0,
  setStatus: (status) => set({ status }),
  setRetryCount: (count) => set({ retryCount: count }),
}));
