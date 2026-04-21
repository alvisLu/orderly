import { z } from "zod";
import { paginationDto } from "@/lib/dto";

export const createExpenseDto = z.object({
  reimburse: z.string().max(255).nullish(),
  expendType: z.string().max(100).nullish(),
  payMethod: z.string().max(50).nullish(),
  price: z.number().nonnegative().default(0),
  description: z.string().nullish(),
  expendAt: z.coerce.date().optional(),
});

export const updateExpenseDto = z.object({
  reimburse: z.string().max(255).nullish(),
  expendType: z.string().max(100).nullish(),
  payMethod: z.string().max(50).nullish(),
  price: z.number().nonnegative().optional(),
  description: z.string().nullish(),
  expendAt: z.coerce.date().optional(),
});

export const expenseQueryDto = paginationDto.extend({
  sort: z.enum(["asc", "desc"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
