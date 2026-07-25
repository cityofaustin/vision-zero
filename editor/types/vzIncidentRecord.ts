import { Point } from "geojson";

export type VzIncidentRecord = {
  vz_incident_id?: number;
  geom?: Point;
  record_id?: number;
  record_incident_number?: string;
  record_responding_agency?: string | null;
  record_table_name?: string;
  record_address?: string | null;
  record_timestamp?: string | null;
};
