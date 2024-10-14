import { ReactNode } from "react";

export interface CrashListCrash {
  id: number;
  cris_crash_id: number | null;
  record_locator: string;
  address_primary: string | null;
  address_secondary: string | null;
}

export interface Crash {
  id: number;
  cris_crash_id: number | null;
  crash_timestamp: string | null;
  record_locator: string;
  address_primary: string | null;
  address_secondary: string | null;
  latitude: number | null;
  longitude: number | null;
  investigator_narrative: string | null;
  is_temp_record: boolean;
  rpt_street_name: string | null;
}

export type TableColumn<T> = {
  key: keyof T;
  label: string;
  relationshipName?: string;
  renderer?: (row: T) => ReactNode;
  editable?: boolean;
};
