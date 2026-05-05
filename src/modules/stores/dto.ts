import { z } from "zod";

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

const timeSlotSchema = z
  .object({
    open: z.string().regex(HHMM, "格式須為 HH:mm"),
    close: z.string().regex(HHMM, "格式須為 HH:mm"),
  })
  .refine((s) => s.open < s.close, {
    message: "結束時間必須晚於開始時間",
    path: ["close"],
  });

const daySlotsSchema = z.array(timeSlotSchema);

export const openingSchema = z
  .object({
    weekly: z.object({
      "0": daySlotsSchema,
      "1": daySlotsSchema,
      "2": daySlotsSchema,
      "3": daySlotsSchema,
      "4": daySlotsSchema,
      "5": daySlotsSchema,
      "6": daySlotsSchema,
    }),
  })
  .refine(
    (data) =>
      Object.values(data.weekly).every((slots) => {
        const sorted = [...slots].sort((a, b) => a.open.localeCompare(b.open));
        return sorted.every(
          (slot, i) => i === 0 || slot.open >= sorted[i - 1].close,
        );
      }),
    { message: "同一天的時段不可重疊", path: ["weekly"] },
  );

export const onlineOrderingSchema = z.enum(["auto", "enabled", "disabled"]);

export const updateStoreDto = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).nullable().optional(),
  address: z.string().max(200).nullable().optional(),
  bannerURL: z.string().url().nullable().optional(),
  opening: openingSchema.optional(),
  onlineOrdering: onlineOrderingSchema.optional(),
  orderCounter: z.number().int().min(0).optional(),
});
