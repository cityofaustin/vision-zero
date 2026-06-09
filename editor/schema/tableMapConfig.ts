import { z } from "zod";

export const TableMapConfigSchema = z.object({
  isActive: z.boolean(),
  geojsonTransformerName: z.enum(["latLon", "pointFeature"]),
  layerProps: z.record(z.unknown()).optional(),
  mapProps: z.record(z.unknown()).optional(),
  featureLimit: z.number().optional(),
  popupComponentName: z
    .enum([
      "locationTableMap",
      "fatalitiesTableMap",
      "emsTableMap",
      "cadTableMap",
      "vzTableMap",
    ])
    .optional(),
  defaultBasemap: z.enum(["streets", "aerial"]),
});
