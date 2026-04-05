import { z } from "zod";
import { paginationDto } from "@/lib/dto";

export const tableQueryDto = paginationDto;

export const createTableDto = z.object({
  name: z.string().min(1).max(50),
  isActive: z.boolean().default(true),
});

export const updateTableDto = z.object({
  name: z.string().min(1).max(50).optional(),
  isActive: z.boolean().optional(),
});
