import { CadIncident } from "@/types/cadIncident";
import { Point } from "geojson";

export type VzIncident = {
  id?: number | null;
  cad_incident_count?: number | null;
  spread_meters?: number | null;
  time_spread_minutes?: number | null;
  incident_numbers?: string[] | null;
  agencies?: string[] | null;
  addresses?: string[] | null;
  address_earliest?: string | null;
  location_ids?: string[] | null;
  call_dispositions?: string[] | null;
  initial_problems?: string[] | null;
  final_problems?: string[] | null;
  response_date_earliest?: string[] | null;
  time_first_unit_arrived_earliest?: string | null;
  point_feature?: Point | null;
  in_austin_full_purpose?: boolean | null;
  cad_incidents?: CadIncident[];
};
