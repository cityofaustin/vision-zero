import { Point } from "geojson";

export type VzIncident = {
  address?: string[] | null;
  id?: number | null;
  in_austin_full_purpose?: boolean | null;
  incident_numbers?: string[] | null;
  latitude?: number | null;
  location_ids?: string[] | null;
  longitude?: number | null;
  point_feature?: Point | null;
  record_count?: number | null;
  record_tables_str?: string;
  record_tables?: string[];
  record_timestamp?: string;
  responding_agencies_str?: string | null; // todo: ensure no nulls in string?
  responding_agencies?: string[];  // todo: ensure no nulls in array
};
