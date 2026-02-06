export type CrashNote = {
  crash_pk: number;
  id: number;
  text: string;
  created_at: string;
  created_by?: string;
  updated_at?: string;
  updated_by: string;
};
