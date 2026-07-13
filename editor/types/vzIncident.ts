import { Point } from "geojson";
import { CadIncident } from "@/types/cadIncident";

export type VzIncident = {
  address?: string[] | null;
  cad_incidents?: CadIncident[] | null;
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
  responding_agencies_str?: string | null;
  responding_agencies?: string[];
};
