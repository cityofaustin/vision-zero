import { z } from "zod";
import { locationsListSchema } from "@/schema/locationsList";

export type LocationsListLocation = z.infer<typeof locationsListSchema>;
