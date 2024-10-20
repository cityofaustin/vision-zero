import { Crash, TableColumn } from "@/types/types";
import { formatDateTime } from "@/utils/formatters";

interface TableColumnIndex<T> {
  [key: string]: TableColumn<T>;
}

// todo: this should work
/**
 * Hold all column types here
 */
const ALL_CRASH_COLUMNS: TableColumnIndex<Crash> = {
  active_school_zone_fl: {
    key: "active_school_zone_fl",
    label: "Active school zone",
    editable: true,
    inputType: "yes_no",
  },
  address_primary: {
    key: "address_primary",
    label: "Address",
  },
  address_secondary: {
    key: "address_secondary",
    label: "Secondary address",
  },
  at_intrsct_fl: {
    key: "at_intrsct_fl",
    label: "At intersection",
    editable: true,
    inputType: "yes_no",
  },
  case_id: {
    key: "case_id",
    label: "Case ID",
  },
  crash_speed_limit: {
    key: "crash_speed_limit",
    label: "Speed limit",
    editable: true,
    inputType: "number",
  },
  crash_timestamp: {
    key: "crash_timestamp",
    label: "Crash date",
    renderer: (crash: Crash) => formatDateTime(crash.crash_timestamp),
  },
  fhe_collsn_id: {
    key: "fhe_collsn_id",
    label: "Collision type",
    editable: true,
    inputType: "select",
    relationshipName: "collsn",
    lookupTable: {
      tableSchema: "lookups",
      tableName: "collsn",
    },
  },
  in_austin_full_purpose: {
    key: "in_austin_full_purpose",
    label: "In Austin Full Purpose Jurisdiction",
  },
  latitude: {
    key: "latitude",
    label: "latitude",
    editable: true,
    inputType: "number",
  },
  law_enforcement_ytd_fatality_num: {
    key: "law_enforcement_ytd_fatality_num",
    label: "Law Enforcement YTD Fatal Crash",
    editable: true,
    inputType: "text",
  },
  light_cond_id: {
    key: "light_cond_id",
    label: "Light condition",
    editable: true,
    inputType: "number",
  },
  longitude: {
    key: "longitude",
    label: "longitude",
    editable: true,
    inputType: "number",
  },
  obj_struck_id: {
    key: "obj_struck_id",
    label: "Object struck",
    editable: true,
    inputType: "number",
  },
  onsys_fl: {
    key: "onsys_fl",
    label: "On TxDOT highway system",
    editable: true,
    inputType: "yes_no",
  },
  private_dr_fl: {
    key: "private_dr_fl",
    label: "Private drive",
    editable: true,
    inputType: "yes_no",
  },
  road_constr_zone_fl: {
    key: "road_constr_zone_fl",
    label: "Road construction zone",
    editable: true,
    inputType: "yes_no",
  },
  rpt_block_num: {
    key: "rpt_block_num",
    label: "Street number",
    editable: true,
    inputType: "text",
  },
  rpt_city_id: {
    key: "rpt_city_id",
    label: "City",
    editable: true,
    inputType: "number",
  },
  rpt_hwy_num: {
    key: "rpt_hwy_num",
    label: "rpt_hwy_num",
    editable: true,
    inputType: "text",
  },
  rpt_rdwy_sys_id: {
    key: "rpt_rdwy_sys_id",
    label: "rpt_rdwy_sys_id",
    editable: true,
    inputType: "number",
  },
  rpt_road_part_id: {
    key: "rpt_road_part_id",
    label: "rpt_road_part_id",
    editable: true,
    inputType: "number",
  },
  rpt_sec_block_num: {
    key: "rpt_sec_block_num",
    label: "rpt_sec_block_num",
    editable: true,
    inputType: "text",
  },
  rpt_sec_hwy_num: {
    key: "rpt_sec_hwy_num",
    label: "rpt_sec_hwy_num",
    editable: true,
    inputType: "text",
  },
  rpt_sec_rdwy_sys_id: {
    key: "rpt_sec_rdwy_sys_id",
    label: "rpt_sec_rdwy_sys_id",
    editable: true,
    inputType: "number",
  },
  rpt_sec_road_part_id: {
    key: "rpt_sec_road_part_id",
    label: "rpt_sec_road_part_id",
    editable: true,
    inputType: "number",
  },
  rpt_sec_street_desc: {
    key: "rpt_sec_street_desc",
    label: "rpt_sec_street_desc",
    editable: true,
    inputType: "text",
  },
  rpt_sec_street_name: {
    key: "rpt_sec_street_name",
    label: "rpt_sec_street_name",
    editable: true,
    inputType: "text",
  },
  rpt_sec_street_pfx: {
    key: "rpt_sec_street_pfx",
    label: "rpt_sec_street_pfx",
    editable: true,
    inputType: "text",
  },
  rpt_sec_street_sfx: {
    key: "rpt_sec_street_sfx",
    label: "rpt_sec_street_sfx",
    editable: true,
    inputType: "text",
  },
  rpt_street_desc: {
    key: "rpt_street_desc",
    label: "rpt_street_desc",
    editable: true,
    inputType: "text",
  },
  rpt_street_name: {
    key: "rpt_street_name",
    label: "Street name",
    editable: true,
    inputType: "text",
  },
  rpt_street_pfx: {
    key: "rpt_street_pfx",
    label: "rpt_street_pfx",
    editable: true,
    inputType: "text",
  },
  rpt_street_sfx: {
    key: "rpt_street_sfx",
    label: "rpt_street_sfx",
    editable: true,
    inputType: "text",
  },
  rr_relat_fl: {
    key: "rr_relat_fl",
    label: "Railroad related",
    editable: true,
    inputType: "yes_no",
  },
  schl_bus_fl: {
    key: "schl_bus_fl",
    label: "School bus",
    editable: true,
    inputType: "yes_no",
  },
  toll_road_fl: {
    key: "toll_road_fl",
    label: "Toll road/lane",
    editable: true,
    inputType: "yes_no",
  },
  traffic_cntl_id: {
    key: "traffic_cntl_id",
    label: "traffic_cntl_id",
    editable: true,
    inputType: "number",
  },
  updated_at: {
    key: "updated_at",
    label: "updated_at",
  },
  updated_by: {
    key: "updated_by",
    label: "updated_by",
  },
  wthr_cond_id: {
    key: "wthr_cond_id",
    label: "wthr_cond_id",
    editable: true,
    inputType: "number",
  },
};

/** Construct card-specific arrays of columns */
export const crashDataCards = {
  summary: [
    ALL_CRASH_COLUMNS.case_id,
    ALL_CRASH_COLUMNS.crash_timestamp,
    ALL_CRASH_COLUMNS.fhe_collsn_id,
    ALL_CRASH_COLUMNS.rpt_city_id,
  ],
  flags: [
    ALL_CRASH_COLUMNS.private_dr_fl,
    ALL_CRASH_COLUMNS.at_intrsct_fl,
    ALL_CRASH_COLUMNS.active_school_zone_fl,
    ALL_CRASH_COLUMNS.onsys_fl,
    ALL_CRASH_COLUMNS.rr_relat_fl,
    ALL_CRASH_COLUMNS.road_constr_zone_fl,
    ALL_CRASH_COLUMNS.schl_bus_fl,
    ALL_CRASH_COLUMNS.toll_road_fl,
  ],
  other: [
    ALL_CRASH_COLUMNS.light_cond_id,
    ALL_CRASH_COLUMNS.crash_speed_limit,
    ALL_CRASH_COLUMNS.obj_struck_id,
    ALL_CRASH_COLUMNS.law_enforcement_ytd_fatality_num,
  ],
  address: [
    ALL_CRASH_COLUMNS.rpt_block_num,
    ALL_CRASH_COLUMNS.rpt_street_pfx,
    ALL_CRASH_COLUMNS.rpt_street_name,
    ALL_CRASH_COLUMNS.rpt_street_sfx,
    ALL_CRASH_COLUMNS.rpt_street_desc,
    ALL_CRASH_COLUMNS.rpt_road_part_id,
    ALL_CRASH_COLUMNS.rpt_rdwy_sys_id,
    ALL_CRASH_COLUMNS.rpt_hwy_num,
  ],
  address_secondary: [
    ALL_CRASH_COLUMNS.rpt_sec_block_num,
    ALL_CRASH_COLUMNS.rpt_sec_street_pfx,
    ALL_CRASH_COLUMNS.rpt_sec_street_name,
    ALL_CRASH_COLUMNS.rpt_sec_street_sfx,
    ALL_CRASH_COLUMNS.rpt_sec_street_desc,
    ALL_CRASH_COLUMNS.rpt_sec_road_part_id,
    ALL_CRASH_COLUMNS.rpt_sec_rdwy_sys_id,
    ALL_CRASH_COLUMNS.rpt_sec_hwy_num,
  ],
};
