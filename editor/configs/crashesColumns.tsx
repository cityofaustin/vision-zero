import { ColDataCardDef } from "@/types/types";
import { Crash } from "@/types/crashes";
import { formatDateTimeWithDay } from "@/utils/formatters";
import { commonValidations } from "@/utils/formHelpers";
import Link from "next/link";

export const crashesColumns = {
  active_school_zone_fl: {
    path: "active_school_zone_fl",
    label: "Active school zone",
    editable: true,
    inputType: "yes_no",
  },
  record_locator: {
    path: "record_locator",
    label: "Crash ID",
  },
  record_locator_hyperlinked: {
    path: "record_locator",
    label: "Crash ID",
    sortable: true,
    valueRenderer: (record: Crash) => (
      <Link href={`/crashes/${record.record_locator}`} prefetch={false}>
        {record.record_locator}
      </Link>
    ),
  },
  address_display: {
    path: "address_display",
    label: "Address",
  },
  at_intrsct_fl: {
    path: "at_intrsct_fl",
    label: "At intersection",
    editable: true,
    inputType: "yes_no",
  },
  case_id: {
    path: "case_id",
    label: "Case ID",
  },
  crash_speed_limit: {
    path: "crash_speed_limit",
    label: "Speed limit",
    editable: true,
    inputType: "number",
    inputOptions: {
      validate: commonValidations.isNullableInteger,
      min: { value: 1, message: "Must be a positive integer" },
    },
  },
  crash_timestamp: {
    path: "crash_timestamp",
    label: "Crash date",
    valueFormatter: formatDateTimeWithDay,
  },
  collsn: {
    path: "collsn.label",
    label: "Collision type",
    editable: true,
    inputType: "select",
    relationship: {
      tableSchema: "lookups",
      tableName: "collsn",
      idColumnName: "id",
      labelColumnName: "label",
      foreignKey: "fhe_collsn_id",
    },
  },
  in_austin_full_purpose: {
    path: "in_austin_full_purpose",
    label: "In Austin Full Purpose Jurisdiction",
  },
  latitude: {
    path: "latitude",
    label: "latitude",
    editable: true,
    inputType: "number",
  },
  law_enforcement_ytd_fatality_num: {
    path: "law_enforcement_ytd_fatality_num",
    label: "Law Enforcement YTD Fatal Crash",
    editable: true,
    inputType: "text",
  },
  light_cond: {
    path: "light_cond.label",
    label: "Light condition",
    editable: true,
    inputType: "select",
    relationship: {
      tableSchema: "lookups",
      tableName: "light_cond",
      idColumnName: "id",
      labelColumnName: "label",
      foreignKey: "light_cond_id",
    },
  },
  longitude: {
    path: "longitude",
    label: "longitude",
    editable: true,
    inputType: "number",
  },
  obj_struck: {
    path: "obj_struck.label",
    label: "Object struck",
    editable: true,
    inputType: "select",
    relationship: {
      tableSchema: "lookups",
      tableName: "obj_struck",
      idColumnName: "id",
      labelColumnName: "label",
      foreignKey: "obj_struck_id",
    },
  },
  onsys_fl: {
    path: "onsys_fl",
    label: "On TxDOT highway system",
    editable: true,
    inputType: "yes_no",
  },
  private_dr_fl: {
    path: "private_dr_fl",
    label: "Private drive",
    editable: true,
    inputType: "yes_no",
  },

  road_constr_zone_fl: {
    path: "road_constr_zone_fl",
    label: "Road construction zone",
    editable: true,
    inputType: "yes_no",
  },
  rpt_block_num: {
    path: "rpt_block_num",
    label: "Street number",
    editable: true,
    inputType: "text",
  },
  city: {
    path: "city.label",
    label: "City",
    editable: true,
    inputType: "select",
    relationship: {
      tableSchema: "lookups",
      tableName: "city",
      foreignKey: "rpt_city_id",
      idColumnName: "id",
      labelColumnName: "label",
    },
  },
  rpt_hwy_num: {
    path: "rpt_hwy_num",
    label: "Highway number",
    editable: true,
    inputType: "text",
  },
  rpt_rdwy_sys_id: {
    path: "rpt_rdwy_sys_id",
    label: "Roadway system",
    editable: true,
    inputType: "select",
    relationship: {
      tableSchema: "lookups",
      tableName: "rwy_sys",
      idColumnName: "id",
      labelColumnName: "label",
      foreignKey: "rpt_rdwy_sys_id",
    },
  },
  rpt_road_part_id: {
    path: "rpt_road_part_id",
    label: "Roadway part",
    editable: true,
    inputType: "select",
    relationship: {
      tableSchema: "lookups",
      tableName: "road_part",
      idColumnName: "id",
      labelColumnName: "label",
      foreignKey: "rpt_road_part_id",
    },
  },
  rpt_hwy_sfx: {
    path: "rpt_hwy_sfx",
    label: "Highway suffix",
    editable: true,
    inputType: "text",
  },
  rpt_sec_block_num: {
    path: "rpt_sec_block_num",
    label: "Street number",
    editable: true,
    inputType: "text",
  },
  rpt_sec_hwy_num: {
    path: "rpt_sec_hwy_num",
    label: "Highway number",
    editable: true,
    inputType: "text",
  },
  rpt_sec_rdwy_sys_id: {
    path: "rpt_sec_rdwy_sys_id",
    label: "Roadway system",
    editable: true,
    inputType: "select",
    relationship: {
      tableSchema: "lookups",
      tableName: "rwy_sys",
      idColumnName: "id",
      labelColumnName: "label",
      foreignKey: "rpt_sec_rdwy_sys_id",
    },
  },
  rpt_sec_road_part_id: {
    path: "rpt_sec_road_part_id",
    label: "Roadway part",
    editable: true,
    inputType: "select",
    relationship: {
      tableSchema: "lookups",
      tableName: "road_part",
      idColumnName: "id",
      labelColumnName: "label",
      foreignKey: "rpt_sec_road_part_id",
    },
  },
  rpt_sec_street_desc: {
    path: "rpt_sec_street_desc",
    label: "Description",
    editable: true,
    inputType: "text",
  },
  rpt_sec_street_name: {
    path: "rpt_sec_street_name",
    label: "Street name",
    editable: true,
    inputType: "text",
  },
  rpt_sec_street_pfx: {
    path: "rpt_sec_street_pfx",
    label: "Street prefix",
    editable: true,
    inputType: "text",
  },
  rpt_sec_street_sfx: {
    path: "rpt_sec_street_sfx",
    label: "Street suffix",
    editable: true,
    inputType: "text",
  },
  rpt_sec_hwy_sfx: {
    path: "rpt_sec_hwy_sfx",
    label: "Highway suffix",
    editable: true,
    inputType: "text",
  },
  rpt_street_desc: {
    path: "rpt_street_desc",
    label: "Description",
    editable: true,
    inputType: "text",
  },
  rpt_street_name: {
    path: "rpt_street_name",
    label: "Street name",
    editable: true,
    inputType: "text",
  },
  rpt_street_pfx: {
    path: "rpt_street_pfx",
    label: "Street prefix",
    editable: true,
    inputType: "text",
  },
  rpt_street_sfx: {
    path: "rpt_street_sfx",
    label: "Street suffix",
    editable: true,
    inputType: "text",
  },
  rr_relat_fl: {
    path: "rr_relat_fl",
    label: "Railroad related",
    editable: true,
    inputType: "yes_no",
  },
  schl_bus_fl: {
    path: "schl_bus_fl",
    label: "School bus",
    editable: true,
    inputType: "yes_no",
  },
  toll_road_fl: {
    path: "toll_road_fl",
    label: "Toll road/lane",
    editable: true,
    inputType: "yes_no",
  },
  traffic_cntl_id: {
    path: "traffic_cntl_id",
    label: "traffic_cntl_id",
    editable: true,
    inputType: "number",
  },
  updated_at: {
    path: "updated_at",
    label: "updated_at",
  },
  updated_by: {
    path: "updated_by",
    label: "updated_by",
  },
  wthr_cond_id: {
    path: "wthr_cond_id",
    label: "wthr_cond_id",
    editable: true,
    inputType: "number",
  },
} satisfies Record<string, ColDataCardDef<Crash>>;
