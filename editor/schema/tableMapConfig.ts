import { z } from "zod";

export const TableMapConfigSchema = z.object({
  isActive: z.boolean(),
  geojsonTransformerName: z.literal("latLon"),
  layerProps: z.record(z.unknown()).optional(),
  featureLimit: z.number().optional(),
  popupComponentName: z.literal("locationTableMap").optional(),
  defaultBaseMap: z.enum(["streets", "aerial"]),
});
