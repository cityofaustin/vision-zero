import { z } from "zod";
import { multiPolygonSchema } from "./geojsonSchema";
import { locationsListSchema } from "./locationsList";

export const locationSchema = z.object({
  location_id: z.string(),
  description: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  geometry: multiPolygonSchema.nullable(),
  street_level: z.string().nullable(),
  locations_list_view: locationsListSchema.partial().nullable(),
});
