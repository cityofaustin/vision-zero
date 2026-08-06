import { Point } from "geojson";
import { AfdIncident } from "@/types/afd";
import { CadIncident } from "@/types/cadIncident";
import { Crash } from "@/types/crashes";
import { EMSPatientCareRecord } from "@/types/ems";
import { VzIncidentRecord } from "@/types/vzIncidentRecord";

export type VzIncidentListRow = {
  address?: string[] | null;
  afd__incidents?: AfdIncident[] | null;
  cad_incidents?: CadIncident[] | null;
  crashes?: Crash[] | null;
  ems__incidents?: EMSPatientCareRecord[] | null;
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
  responding_agencies?: string[] | null;
  vz_incident_records_view?: VzIncidentRecord[];
};
