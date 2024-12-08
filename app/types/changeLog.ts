import { z } from "zod";
import { changeLogEntrySchema } from "@/schema/changeLog";

export type ChangeLogEntry = z.infer<typeof changeLogEntrySchema>;

export type ChangeLogDiff = {
  field: string;
  old: unknown;
  new: unknown;
};

export interface ChangeLogEntryEnriched extends ChangeLogEntry {
  diffs: ChangeLogDiff[];
  affected_fields: string[];
}
