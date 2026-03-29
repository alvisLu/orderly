import type { Payment } from "@/generated/prisma/client";

export type { Payment };

export type CreatePaymentInput = Pick<
  Payment,
  "name" | "type" | "isPosAvailable" | "isMenuAvailable" | "rank"
>;
export type UpdatePaymentInput = Partial<
  Pick<Payment, "name" | "type" | "isPosAvailable" | "isMenuAvailable" | "rank">
>;
