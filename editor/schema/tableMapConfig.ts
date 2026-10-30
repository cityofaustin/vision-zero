import { z } from "zod";

export const TableMapConfigSchema = z.object({
  isActive: z.boolean(),
  geojsonTransformerName: z.literal("latLon"),
  layerProps: z.record(z.unknown()).optional(),
  mapProps: z.record(z.unknown()).optional(),
  featureLimit: z.number().optional(),
  popupComponentName: z.enum(["locationTableMap", "fatalitiesTableMap"]).optional(),
  defaultBasemap: z.enum(["streets", "aerial"]),
});
