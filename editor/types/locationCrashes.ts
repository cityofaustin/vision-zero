/**
 * Type which describes the `location_crashes_view`, which combines
 * CR3 and Non-CR3 crashes
 */
export type LocationCrashRow = {
  address_display: string | null;
  case_id: string | null;
  collsn_desc: string | null;
  crash_date: string | null;
  crash_sev_id: number | null;
  crash_time: string | null;
  crash_timestamp: string | null;
  record_locator: string | null;
  cris_crash_id: number | null;
  day_of_week: string;
  est_comp_cost_crash_based: number | null;
  latitude: number | null;
  location_id: string;
  longitude: number | null;
  movement_desc: string | null;
  non_injry_count: number | null;
  nonincap_injry_count: number | null;
  poss_injry_count: number | null;
  sus_serious_injry_count: number | null;
  tot_injry_count: number | null;
  travel_direction: string | null;
  type: "CR3" | "NON-CR3";
  unkn_injry_count: number | null;
  veh_body_styl_desc: string | null;
  veh_unit_desc: string | null;
  vz_fatality_count: number | null;
};
