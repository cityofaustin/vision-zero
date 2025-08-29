import Link from "next/link";
import { formatDate, formatDollars, formatTime } from "@/utils/formatters";
import { ColDataCardDef } from "@/types/types";
import { CrashesListRow } from "@/types/crashesList";

export const crashesListViewColumns: ColDataCardDef<CrashesListRow>[] = [
  {
    path: "record_locator",
    label: "Crash ID",
    sortable: true,
    valueRenderer: (record: CrashesListRow) => (
      <Link href={`/crashes/${record.record_locator}`} prefetch={false}>
        {record.record_locator}
      </Link>
    ),
  },
  {
    path: "case_id",
    label: "Case ID",
    sortable: true,
  },
  {
    path: "crash_timestamp",
    label: "Date",
    sortable: true,
    style: { minWidth: "8rem" },
    valueFormatter: formatDate,
    fetchAlways: true,
  },
  {
    path: "crash_timestamp",
    label: "Time",
    sortable: true,
    defaultHidden: true,
    valueFormatter: formatTime,
    style: { minWidth: "6rem" },
  },
  {
    path: "crash_day_of_week",
    label: "Day of week",
    defaultHidden: true,
    sortable: true,
  },
  {
    path: "crash_date_ct",
    label: "crash_date_ct",
    exportOnly: true,
  },
  {
    path: "address_primary",
    label: "Address",
    sortable: true,
    fetchAlways: true,
  },
  {
    path: "council_district",
    label: "Council district",
    defaultHidden: true,
    sortable: true,
  },
  {
    path: "collsn_desc",
    label: "Collision",
    sortable: true,
  },
  {
    path: "vz_fatality_count",
    label: "Fatalities",
    sortable: true,
  },
  {
    path: "sus_serious_injry_count",
    label: "Serious Injuries",
    sortable: true,
  },
  {
    path: "nonincap_injry_count",
    label: "Minor injuries",
    defaultHidden: true,
    sortable: true,
  },
  {
    path: "unkn_injry_count",
    label: "unkn_injry_count",
    exportOnly: true,
  },
  {
    path: "est_comp_cost_crash_based",
    label: "Est Comp Cost",
    sortable: true,
    valueFormatter: formatDollars,
  },
  {
    path: "crash_injry_sev_desc",
    label: "crash_injry_sev_desc",
    exportOnly: true,
  },
  {
    path: "crash_speed_limit",
    label: "crash_speed_limit",
    exportOnly: true,
  },
  {
    path: "cris_crash_id",
    label: "cris_crash_id",
    exportOnly: true,
  },
  {
    path: "cris_fatality_count",
    label: "cris_fatality_count",
    exportOnly: true,
  },
  {
    path: "intrsct_relat_id",
    label: "intrsct_relat_id",
    exportOnly: true,
  },
  {
    path: "light_cond_id",
    label: "light_cond_id",
    exportOnly: true,
  },
  {
    path: "latitude",
    label: "latitude",
    exportOnly: true,
    fetchAlways: true,
  },
  {
    path: "longitude",
    label: "longitude",
    exportOnly: true,
    fetchAlways: true,
  },
  {
    path: "non_injry_count",
    label: "non_injry_count",
    exportOnly: true,
  },
  {
    path: "obj_struck_id",
    label: "obj_struck_id",
    exportOnly: true,
  },
  {
    path: "onsys_fl",
    label: "onsys_fl",
    exportOnly: true,
  },
  {
    path: "poss_injry_count",
    label: "poss_injry_count",
    exportOnly: true,
  },
  {
    path: "private_dr_fl",
    label: "private_dr_fl",
    exportOnly: true,
  },
  {
    path: "road_constr_zone_fl",
    label: "road_constr_zone_fl",
    exportOnly: true,
  },
  {
    path: "rpt_block_num",
    label: "rpt_block_num",
    exportOnly: true,
  },
  {
    path: "rpt_sec_block_num",
    label: "rpt_sec_block_num",
    exportOnly: true,
  },
  {
    path: "rpt_sec_street_name",
    label: "rpt_sec_street_name",
    exportOnly: true,
  },
  {
    path: "rpt_sec_street_pfx",
    label: "rpt_sec_street_pfx",
    exportOnly: true,
  },
  {
    path: "rpt_street_name",
    label: "rpt_street_name",
    exportOnly: true,
  },
  {
    path: "rpt_street_pfx",
    label: "rpt_street_pfx",
    exportOnly: true,
  },
  {
    path: "rr_relat_fl",
    label: "rr_relat_fl",
    exportOnly: true,
  },
  {
    path: "schl_bus_fl",
    label: "schl_bus_fl",
    exportOnly: true,
  },
  {
    path: "toll_road_fl",
    label: "toll_road_fl",
    exportOnly: true,
  },
  {
    path: "traffic_cntl_id",
    label: "traffic_cntl_id",
    exportOnly: true,
  },
  {
    path: "wthr_cond_id",
    label: "wthr_cond_id",
    exportOnly: true,
  },
];
