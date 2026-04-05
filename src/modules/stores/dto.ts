import { z } from "zod";

export const updateStoreDto = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).nullable().optional(),
  address: z.string().max(200).nullable().optional(),
  bannerURL: z.string().url().nullable().optional(),
  opening: z.any().optional(),
});
