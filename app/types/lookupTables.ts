import { z } from "zod";
import { lookupOptionSchema } from "@/schema/lookupTable";

export interface LookupTableDef {
  tableSchema: "public" | "lookups";
  tableName: string;
}

export type LookupTableOption = z.infer<typeof lookupOptionSchema>;
