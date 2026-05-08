import { z } from "zod";
import { paginationDto } from "@/lib/dto";

export const CURRENCY_DENOMINATIONS = [
  1, 5, 10, 50, 100, 200, 500, 1000,
] as const;

export const currencyEntryDto = z.object({
  denomination: z.union([
    z.literal(1),
    z.literal(5),
    z.literal(10),
    z.literal(50),
    z.literal(100),
    z.literal(200),
    z.literal(500),
    z.literal(1000),
  ]),
  count: z.number().int().nonnegative(),
});

export const currenciesDto = z.array(currencyEntryDto);

export const createMoneyCountDto = z.object({
  currencies: currenciesDto.default([]),
});

export const moneyCountQueryDto = paginationDto.extend({
  limit: z.coerce.number().int().positive().max(10000).default(20),
  sort: z.enum(["asc", "desc"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
