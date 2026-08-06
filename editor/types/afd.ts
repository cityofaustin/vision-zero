import { Point } from "geojson";

export type AfdIncident = {
  id?: string;
  incident_number?: number | null;
  crash_id?: number | null;
  unparsed_ems_incident_number?: string | null;
  ems_incident_numbers?: number[] | null;
  calendar_year?: number | null;
  jurisdiction?: string | null;
  address?: string | null;
  problem?: string | null;
  flagged_incs?: number | null;
  geometry?: Point | null;
  austin_full_purpose?: boolean | null;
  location_id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  ems_incident_number_1?: number | null;
  ems_incident_number_2?: number | null;
  call_datetime?: string | null;
  created_at?: string;
  updated_at?: string;
  vz_incident_id?: number | null;
  vz_incident_match_status?: string;
  vz_incident_matched_ids?: number[] | null;
};
