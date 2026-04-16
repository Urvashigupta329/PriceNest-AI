import { z } from "zod";
import { getPropertyHistoryTrend } from "./property.service";

export const analyticsQuerySchema = z.object({
  location: z.string().trim().min(2).max(80),
  months: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 12))
    .refine((n) => Number.isFinite(n) && n > 0 && n <= 60, {
      message: "months must be between 1 and 60"
    })
    .optional()
});

export async function getTrend(location: string, months = 12) {
  return getPropertyHistoryTrend(location, months);
}

