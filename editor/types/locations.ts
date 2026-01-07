import { MultiPolygon } from "./geojson";
import { LocationsListRow } from "./locationsList";
import { LocationNote } from "@/types/locationNote";

export type Location = {
  location_id: string;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  geometry: MultiPolygon | null;
  street_level: string | null;
  locations_list_view: LocationsListRow | null;
  location_notes: LocationNote[]
};
