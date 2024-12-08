import { z } from "zod";
import { crashInjuryMetricsSchema } from "@/schema/crashInjuryMetrics";

export type CrashInjuryMetrics = z.infer<typeof crashInjuryMetricsSchema>;
