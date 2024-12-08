import { z } from "zod";
import { crashesListSchema } from "@/schema/crashesList";

export type CrashesListCrash = z.infer<typeof crashesListSchema>;
