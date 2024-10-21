import { TableColumn } from "@/types/types";
import { ALL_CRASH_COLUMNS } from "./crashColumns";

interface TableColumnIndex<T> {
  [key: string]: TableColumn<T>;
}

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
