import { ReactNode } from "react";
import { Variables } from "graphql-request";

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
  updated_by: string | null;
  updated_at: string | null;
  crash_speed_limit: number | null;
  fhe_collsn_id: number | null;
}

export interface LookupTableDef {
  tableSchema: "public" | "lookups";
  tableName: string;
}

export interface LookupTableOption {
  id: number;
  label: string;
}

export type InputType = "text" | "number" | "select";

export type FormInputValue = string | number | boolean | null | undefined;

export interface HasuraLookupTableData{
    [key: string]: LookupTableOption[]
}

export type TableColumn<T> = {
  key: keyof T;
  label: string;
  relationshipName?: string;
  editable?: boolean;
  inputType?: InputType;
  lookupTable?: LookupTableDef;
  renderer?: (row: T) => ReactNode;
};

interface MutationUpdates {
  [key: string]: any;
  updated_by?: string;
}

export interface MutationVariables extends Variables {
  [key: string]: any;
  updates?: MutationUpdates;
}

export interface LatLon {
  latitude: number | null;
  longitude: number | null;
}
