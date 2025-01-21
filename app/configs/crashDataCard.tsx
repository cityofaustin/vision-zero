import { crashesColumns } from "./crashesColumns";

export const crashDataCards = {
  summary: [
    crashesColumns.case_id,
    crashesColumns.crash_timestamp,
    crashesColumns.collsn,
    crashesColumns.city,
  ],
  flags: [
    crashesColumns.private_dr_fl,
    crashesColumns.at_intrsct_fl,
    crashesColumns.active_school_zone_fl,
    crashesColumns.onsys_fl,
    crashesColumns.rr_relat_fl,
    crashesColumns.road_constr_zone_fl,
    crashesColumns.schl_bus_fl,
    crashesColumns.toll_road_fl,
  ],
  other: [
    crashesColumns.light_cond,
    crashesColumns.crash_speed_limit,
    crashesColumns.obj_struck,
    crashesColumns.law_enforcement_ytd_fatality_num,
  ],
  address: [
    crashesColumns.rpt_block_num,
    crashesColumns.rpt_street_pfx,
    crashesColumns.rpt_street_name,
    crashesColumns.rpt_street_sfx,
    crashesColumns.rpt_street_desc,
    crashesColumns.road_part,
    crashesColumns.rwy_sys,
    crashesColumns.rpt_hwy_num,
  ],
  address_secondary: [
    crashesColumns.rpt_sec_block_num,
    crashesColumns.rpt_sec_street_pfx,
    crashesColumns.rpt_sec_street_name,
    crashesColumns.rpt_sec_street_sfx,
    crashesColumns.rpt_sec_street_desc,
    crashesColumns.road_part_sec,
    crashesColumns.rwy_sys_sec,
    crashesColumns.rpt_sec_hwy_num,
  ],
};
