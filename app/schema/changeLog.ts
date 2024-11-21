import { z } from "zod";

export const changeLogEntrySchema = z.object({
  id: z.number(),
  crash_pk: z.number(),
  created_at: z.string(),
  created_by: z.string(),
  operation_type: z.enum(["create", "update"]),
  record_id: z.number(),
  record_type: z.string(),
  record_json: z.object({
    old: z.record(z.string(), z.unknown()),
    new: z.record(z.string(), z.unknown()),
  }),
});
