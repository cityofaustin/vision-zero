import { z } from "zod";

const coordinateSchema = z.array(z.number()).length(2);

export const multiPolygonSchema = z.object({
  type: z.literal("MultiPolygon"),
  crs: z
    .object({
      type: z.string(),
      properties: z.object({}),
    })
    .optional(),
  coordinates: z.array(z.array(z.array(coordinateSchema))),
});
