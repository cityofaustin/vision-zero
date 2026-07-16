import { Point } from "geojson";
import { AfdIncident } from "@/types/afd";
import { CadIncident } from "@/types/cadIncident";
import { Crash } from "@/types/crashes";
import { EMSPatientCareRecord } from "@/types/ems";

export type VzIncidentListRow = {
  afd__incidents?: AfdIncident[] | null;
  address?: string[] | null;
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
  responding_agencies?: string[];
  vz_incident_records_view?: {
    vz_incident_id: number;
    geom: Point;
    record_id: number;
    record_incident_number: string;
    record_responding_agency: string | null;
    record_table_name: string;
    record_address: string | null;
    record_timestamp: string | null;
  }[];
};
