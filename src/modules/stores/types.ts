import type { Store as PrismaStore, Prisma } from "@/generated/prisma/client";

export type TimeSlot = { open: string; close: string };

export type WeekDay = "0" | "1" | "2" | "3" | "4" | "5" | "6";

export type Opening = { weekly: Record<WeekDay, TimeSlot[]> };

export const EMPTY_OPENING: Opening = {
  weekly: { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
};

export type Store = Omit<PrismaStore, "opening"> & { opening: Opening };

export type UpdateStoreInput = Omit<Prisma.StoreUpdateInput, "opening"> & {
  opening?: Opening;
};
