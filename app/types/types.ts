import { ReactNode } from "react";
import { Variables } from "graphql-request";
import { boolean } from "zod";

export interface LookupTableDef {
  tableSchema: "public" | "lookups";
  tableName: string;
}

export interface LookupTableOption {
  id: number;
  label: string;
}

export type InputType = "text" | "number" | "yes_no" | "select";

/**
 * The base definition of a database column referenced by our app — where
 * <T> should be one of our core record types (Crash, Person, etc)
 */
export type ColBaseDef<T extends Record<string, unknown>> = {
  /**
   * the column name in the database
   */
  name: keyof T;
  /**
   * label which will be rendered wherever this value is displayed in the app
   */
  label: string;
};

export interface ColDataCardDef<T extends Record<string, unknown>>
  extends ColBaseDef<T> {
  editable?: boolean;
  inputType?: InputType;
  lookupTable?: LookupTableDef;
  relationshipName?: keyof T;
  sortable?: boolean;
  valueGetter?: (record: T, column: ColDataCardDef<T>) => any;
  valueFormatter?: (value: any, record: T, column: ColDataCardDef<T>) => string;
  valueRenderer?: (record: T, column: ColDataCardDef<T>) => ReactNode;
}

export interface MutationVariables extends Variables {
  [key: string]: any;
  updates?: {
    [key: string]: any;
    updated_by?: string;
  };
}

export interface CrashListCrash extends Record<string, unknown> {
  id: number;
  cris_crash_id: number | null;
  record_locator: string;
  address_primary: string | null;
  address_secondary: string | null;
}

export type ChangeLogDiff = {
  field: string;
  old: unknown;
  new: unknown;
};

export interface ChangeLogEntry {
  id: number;
  crash_pk: number;
  created_at: string;
  created_by: string;
  operation_type: "create" | "update";
  record_id: number;
  record_type: string;
  record_json: { old: Record<string, unknown>; new: Record<string, unknown> };
}

export interface ChangeLogEntryEnriched extends ChangeLogEntry {
  diffs: ChangeLogDiff[];
  affected_fields: string[];
}

/**
 * Primary interface for crash records
 *
 * todo: make all non-required props optional
 * todo: add type guards for non-nullable fields (e.g. with Zod)?
 * todo: use graphql-codegen for these?
 */
export interface Crash extends Record<string, unknown> {
  active_school_zone_fl: number | null;
  address_primary: string | null;
  address_secondary: string | null;
  at_intrsct_fl: boolean | null;
  case_id: string | null;
  crash_injury_metrics_view: CrashInjuryMetrics;
  cr3_stored_fl: boolean | null;
  crash_speed_limit: number | null;
  crash_timestamp: string | null;
  cris_crash_id: number | null;
  // todo: notice how collsn and fhe_collsn_id are required types to support the lookup table :/
  collsn: LookupTableOption;
  fhe_collsn_id: number | null;
  id: number;
  in_austin_full_purpose: boolean;
  investigator_narrative: string | null;
  is_temp_record: boolean | null;
  latitude: number | null;
  law_enforcement_ytd_fatality_num: string | null;
  light_cond_id: number | null;
  location_id: string | null;
  longitude: number | null;
  obj_struck_id: number | null;
  obj_struck: LookupTableOption;
  onsys_fl: boolean | null;
  private_dr_fl: boolean | null;
  record_locator: string;
  road_constr_zone_fl: boolean | null;
  rpt_block_num: string | null;
  rpt_city_id: number | null;
  rpt_hwy_num: string | null;
  rpt_rdwy_sys_id: number | null;
  rpt_road_part_id: number | null;
  rpt_sec_block_num: string | null;
  rpt_sec_hwy_num: string | null;
  rpt_sec_rdwy_sys_id: number | null;
  rpt_sec_road_part_id: number | null;
  rpt_sec_street_desc: string | null;
  rpt_sec_street_name: string | null;
  rpt_sec_street_pfx: string | null;
  rpt_sec_street_sfx: string | null;
  rpt_street_desc: string | null;
  rpt_street_name: string | null;
  rpt_street_pfx: string | null;
  rpt_street_sfx: string | null;
  rr_relat_fl: boolean | null;
  schl_bus_fl: boolean | null;
  toll_road_fl: boolean | null;
  traffic_cntl_id: number | null;
  updated_at: string | null;
  updated_by: string | null;
  wthr_cond_id: number | null;
  change_logs: ChangeLogEntry[];
  units: Unit[];
}

export interface CrashInjuryMetrics {
  vz_fatality_count: number | null;
  years_of_life_lost: number | null;
  est_comp_cost_crash_based: number | null;
  est_total_person_comp_cost: number | null;
  crash_injry_sev_id: number | null;
  nonincap_injry_count: number | null;
  sus_serious_injry_count: number | null;
  poss_injry_count: number | null;
  unkn_injry_count: number | null;
  tot_injry_count: number | null;
  cris_fatality_count: number | null;
  law_enf_fatality_count: number | null;
}

/**
 * Primary interface for unit records
 *
 */
export interface Unit extends Record<string, unknown> {
  id: number;
  contrib_factr: LookupTableOption;
  contrib_factr_1_id: number | null;
  unit_nbr: number | null;
  veh_body_styl: LookupTableOption;
  veh_body_styl_id: number | null;
  veh_make: LookupTableOption;
  veh_make_id: number | null;
  veh_mod: LookupTableOption;
  veh_mod_id: number | null;
  veh_mod_year: number | null;
  unit_desc: LookupTableOption;
  unit_desc_id: number | null;
  trvl_dir: LookupTableOption;
  veh_trvl_dir_id: number | null;
  movt: LookupTableOption;
  movement_id: number | null;
}
