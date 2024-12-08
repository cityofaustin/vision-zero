import { z } from "zod";
import { crashSchema } from "@/schema/crashes";

export type Crash = z.infer<typeof crashSchema>;
