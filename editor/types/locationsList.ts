export type LocationsListRow = {
  location_id?: string;
  location_name?: string | null;
  cr3_crash_count?: number | null;
  non_cr3_crash_count?: number | null;
  total_est_comp_cost?: number | null;
  apd_sectors?: string[];
  area_eng_areas?: string[];
  council_districts?: number[];
  is_hin?: boolean;
  is_signalized?: boolean;
  location_group?: number;
  signal_eng_areas?: string[];
  street_levels?: number[];
};
