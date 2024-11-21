import { z } from "zod";

export const crashesListSchema = z.object({
  address_primary: z.string().nullable(),
  address_secondary: z.string().nullable(),
  case_id: z.string().nullable(),
  collsn_desc: z.string().nullable(),
  crash_timestamp: z.string().datetime({ offset: true }).nullable(),
  cris_crash_id: z.number().nullable(),
  id: z.number(),
  record_locator: z.string(),
});
