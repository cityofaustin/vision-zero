import { z } from "zod";

export const locationsListSchema = z.object({
  location_id: z.string(),
  description: z.string().nullable(),
  cr3_crash_count: z.number().nullable(),
  non_cr3_crash_count: z.number().nullable(),
});
