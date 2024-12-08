import { z } from "zod";
import { locationSchema } from "@/schema/locationSchema";

export type Location = z.infer<typeof locationSchema>;
