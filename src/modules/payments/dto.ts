import { z } from "zod";

const paymentTypeEnum = z.enum(["cash", "custom"]);

export const createPaymentDto = z.object({
  name: z.string().min(1).max(100),
  type: paymentTypeEnum,
  isPosAvailable: z.boolean().default(true),
  isMenuAvailable: z.boolean().default(false),
  rank: z.number().int().nonnegative().default(0),
});

export const reorderPaymentsDto = z.object({
  payments: z
    .array(
      z.object({
        id: z.uuid(),
        rank: z.number().int().nonnegative(),
      })
    )
    .min(1),
});

export const updatePaymentDto = z.object({
  name: z.string().min(1).max(100).optional(),
  type: paymentTypeEnum.optional(),
  isPosAvailable: z.boolean().optional(),
  isMenuAvailable: z.boolean().optional(),
  rank: z.number().int().nonnegative().optional(),
});
