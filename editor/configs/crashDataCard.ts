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
    crashesColumns.veh_hnr_fl,
  ],
  other: [
    crashesColumns.light_cond,
    crashesColumns.crash_speed_limit,
    crashesColumns.obj_struck,
    crashesColumns.law_enforcement_ytd_fatality_num,
  ],
};
