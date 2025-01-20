export type CrashesListRow = {
  address_primary: string | null;
  case_id: string | null;
  collsn_desc: string | null;
  crash_timestamp: string;
  est_comp_cost_crash_based: number | null;
  record_locator: string;
  sus_serious_injry_count: number | null;
  vz_fatality_count: number | null;
  nonincap_injry_count: number | null;
};
