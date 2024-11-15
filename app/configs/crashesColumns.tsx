import { Crash, ColDataCardDef } from "@/types/types";
import { formatDateTime } from "@/utils/formatters";

export const crashesColumns: {
  [name: string]: ColDataCardDef<Crash>;
} = {
  active_school_zone_fl: {
    name: "active_school_zone_fl",
    label: "Active school zone",
    editable: true,
    inputType: "yes_no",
  },
  address_primary: {
    name: "Primary address",
    label: "Address",
  },
  address_secondary: {
    name: "Secondary address",
    label: "Secondary address",
  },
  at_intrsct_fl: {
    name: "at_intrsct_fl",
    label: "At intersection",
    editable: true,
    inputType: "yes_no",
  },
  case_id: {
    name: "case_id",
    label: "Case ID",
  },
  crash_speed_limit: {
    name: "crash_speed_limit",
    label: "Speed limit",
    editable: true,
    inputType: "number",
  },
  crash_timestamp: {
    name: "crash_timestamp",
    label: "Crash date",
    valueFormatter: formatDateTime,
  },
  fhe_collsn_id: {
    name: "fhe_collsn_id",
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
    name: "in_austin_full_purpose",
    label: "In Austin Full Purpose Jurisdiction",
  },
  latitude: {
    name: "latitude",
    label: "latitude",
    editable: true,
    inputType: "number",
  },
  law_enforcement_ytd_fatality_num: {
    name: "law_enforcement_ytd_fatality_num",
    label: "Law Enforcement YTD Fatal Crash",
    editable: true,
    inputType: "text",
  },
  light_cond_id: {
    name: "light_cond_id",
    label: "Light condition",
    editable: true,
    inputType: "number",
  },
  longitude: {
    name: "longitude",
    label: "longitude",
    editable: true,
    inputType: "number",
  },
  obj_struck_id: {
    name: "obj_struck_id",
    label: "Object struck",
    editable: true,
    inputType: "select",
    relationshipName: "obj_struck",
    lookupTable: {
      tableSchema: "lookups",
      tableName: "obj_struck",
    },
  },
  onsys_fl: {
    name: "onsys_fl",
    label: "On TxDOT highway system",
    editable: true,
    inputType: "yes_no",
  },
  private_dr_fl: {
    name: "private_dr_fl",
    label: "Private drive",
    editable: true,
    inputType: "yes_no",
  },
  road_constr_zone_fl: {
    name: "road_constr_zone_fl",
    label: "Road construction zone",
    editable: true,
    inputType: "yes_no",
  },
  rpt_block_num: {
    name: "rpt_block_num",
    label: "Street number",
    editable: true,
    inputType: "text",
  },
  rpt_city_id: {
    name: "rpt_city_id",
    label: "City",
    editable: true,
    inputType: "number",
  },
  rpt_hwy_num: {
    name: "rpt_hwy_num",
    label: "Highway number",
    editable: true,
    inputType: "text",
  },
  rpt_rdwy_sys_id: {
    name: "rpt_rdwy_sys_id",
    label: "Roadway system",
    editable: true,
    inputType: "number",
  },
  rpt_road_part_id: {
    name: "rpt_road_part_id",
    label: "Roadway part",
    editable: true,
    inputType: "number",
  },
  rpt_sec_block_num: {
    name: "rpt_sec_block_num",
    label: "Street number",
    editable: true,
    inputType: "text",
  },
  rpt_sec_hwy_num: {
    name: "rpt_sec_hwy_num",
    label: "Highway number",
    editable: true,
    inputType: "text",
  },
  rpt_sec_rdwy_sys_id: {
    name: "rpt_sec_rdwy_sys_id",
    label: "Roadway system",
    editable: true,
    inputType: "number",
  },
  rpt_sec_road_part_id: {
    name: "rpt_sec_road_part_id",
    label: "Roadway part",
    editable: true,
    inputType: "number",
  },
  rpt_sec_street_desc: {
    name: "rpt_sec_street_desc",
    label: "Street description",
    editable: true,
    inputType: "text",
  },
  rpt_sec_street_name: {
    name: "rpt_sec_street_name",
    label: "Street name",
    editable: true,
    inputType: "text",
  },
  rpt_sec_street_pfx: {
    name: "rpt_sec_street_pfx",
    label: "Street prefix",
    editable: true,
    inputType: "text",
  },
  rpt_sec_street_sfx: {
    name: "rpt_sec_street_sfx",
    label: "Street suffix",
    editable: true,
    inputType: "text",
  },
  rpt_street_desc: {
    name: "rpt_street_desc",
    label: "Street description",
    editable: true,
    inputType: "text",
  },
  rpt_street_name: {
    name: "rpt_street_name",
    label: "Street name",
    editable: true,
    inputType: "text",
  },
  rpt_street_pfx: {
    name: "rpt_street_pfx",
    label: "Street prefix",
    editable: true,
    inputType: "text",
  },
  rpt_street_sfx: {
    name: "rpt_street_sfx",
    label: "Street suffix",
    editable: true,
    inputType: "text",
  },
  rr_relat_fl: {
    name: "rr_relat_fl",
    label: "Railroad related",
    editable: true,
    inputType: "yes_no",
  },
  schl_bus_fl: {
    name: "schl_bus_fl",
    label: "School bus",
    editable: true,
    inputType: "yes_no",
  },
  toll_road_fl: {
    name: "toll_road_fl",
    label: "Toll road/lane",
    editable: true,
    inputType: "yes_no",
  },
  traffic_cntl_id: {
    name: "traffic_cntl_id",
    label: "traffic_cntl_id",
    editable: true,
    inputType: "number",
  },
  updated_at: {
    name: "updated_at",
    label: "updated_at",
  },
  updated_by: {
    name: "updated_by",
    label: "updated_by",
  },
  wthr_cond_id: {
    name: "wthr_cond_id",
    label: "wthr_cond_id",
    editable: true,
    inputType: "number",
  },
};
