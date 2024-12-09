export interface ChangeLogEntry {
  id: string;
  crash_pk: number;
  created_at: string;
  created_by: string;
  operation_type: "create" | "update";
  record_id: number;
  record_type: string;
  record_json: {
    old: Record<string, unknown> | null;
    new: Record<string, unknown>;
  };
}

export type ChangeLogDiff = {
  field: string;
  old: unknown;
  new: unknown;
};

export interface ChangeLogEntryEnriched extends ChangeLogEntry {
  diffs: ChangeLogDiff[];
  affected_fields: string[];
}
