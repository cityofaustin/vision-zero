import { z } from "zod";
import { lookupOptionSchema } from "./lookupTable";

export const unitSchema = z.object({
  id: z.number(),
  contrib_factr: lookupOptionSchema.nullable(),
  contrib_factr_1_id: z.number().nullable(),
  unit_nbr: z.number().nullable(),
  veh_body_styl: lookupOptionSchema.nullable(),
  veh_body_styl_id: z.number().nullable(),
  veh_make: lookupOptionSchema.nullable(),
  veh_make_id: z.number().nullable(),
  veh_mod: lookupOptionSchema.nullable(),
  veh_mod_id: z.number().nullable(),
  veh_mod_year: z.number().nullable(),
  unit_desc: lookupOptionSchema.nullable(),
  unit_desc_id: z.number().nullable(),
  trvl_dir: lookupOptionSchema.nullable(),
  veh_trvl_dir_id: z.number().nullable(),
  movt: lookupOptionSchema.nullable(),
  movement_id: z.number().nullable(),
});

export type Unit = z.infer<typeof unitSchema>;
