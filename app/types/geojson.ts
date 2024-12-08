import { z } from "zod";
import { multiPolygonSchema } from "@/schema/geojsonSchema";

export type MultiPolygon = z.infer<typeof multiPolygonSchema>;
