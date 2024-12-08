import { z } from "zod";

export const lookupOptionSchema = z.object({
  id: z.number(),
  label: z.string(),
});
