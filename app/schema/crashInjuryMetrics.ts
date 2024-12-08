import { z } from "zod";

export const crashInjuryMetricsSchema = z.object({
  vz_fatality_count: z.number().nullable(),
  years_of_life_lost: z.number().nullable(),
  est_comp_cost_crash_based: z.number().nullable(),
  est_total_person_comp_cost: z.number().nullable(),
  crash_injry_sev_id: z.number().nullable(),
  nonincap_injry_count: z.number().nullable(),
  sus_serious_injry_count: z.number().nullable(),
  poss_injry_count: z.number().nullable(),
  unkn_injry_count: z.number().nullable(),
  tot_injry_count: z.number().nullable(),
  cris_fatality_count: z.number().nullable(),
  law_enf_fatality_count: z.number().nullable(),
});
