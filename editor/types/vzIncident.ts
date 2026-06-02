import { GeoJSONFeature } from "mapbox-gl";

export type VzIncident = {
  id?: number | null;
  cad_incident_count?: number | null;
  spread_meters?: number | null;
  time_spread_minutes?: number | null;
  incident_numbers?: string[] | null;
  agencies?: string[] | null;
  addresses?: string[] | null;
  location_ids?: string[] | null;
  call_dispositions?: string[] | null;
  initial_problems?: string[] | null;
  final_problems?: string[] | null;
  first_response_date?: string[] | null;
  time_first_unit_arrived?: string | null;
  incident_points?: GeoJSONFeature | null;
  incident_bbox?: GeoJSONFeature | null;
  incident_convex_hull?: GeoJSONFeature | null;
  incident_bounding_circle?: GeoJSONFeature | null;
  incident_centroid?: GeoJSONFeature | null;
  in_austin_full_purpose?: boolean | null;
};
