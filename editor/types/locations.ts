import { MultiPolygon } from "./geojson";
import { LocationsListRow } from "./locationsList";
import { LocationNote } from "@/types/locationNote";

export type Location = {
  location_id: string;
  location_name: string | null;
  geometry: MultiPolygon | null;
  street_levels: string[] | null;
  locations_list_view: LocationsListRow | null;
  location_notes: LocationNote[];
  apd_sectors?: string[];
  area_eng_areas?: string[];
  council_districts?: number[];
  is_hin?: boolean;
  is_signalized?: boolean;
  location_group?: number;
  signal_eng_areas?: string[];
};
