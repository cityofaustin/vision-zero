import { z } from "zod";

export const crashesListSchema = z.object({
  address_primary: z.string().nullable(),
  case_id: z.string().nullable(),
  collsn_desc: z.string().nullable(),
  crash_timestamp: z.string().datetime({ offset: true }).nullable(),
  record_locator: z.string(),
});
