import Link from "next/link";
import { formatDate } from "@/utils/formatters";
import { ColDataCardDef } from "@/types/types";
import { fatalitiesListRow } from "@/types/fatalitiesList";

export const fatalitiesListViewColumns: ColDataCardDef<fatalitiesListRow>[] = [
  {
    path: "year",
    label: "Year",
    sortable: true,
  },
  {
    path: "record_locator",
    label: "Crash ID",
    sortable: true,
    valueRenderer: (record: fatalitiesListRow) => (
      <Link href={`/fatalities/${record.record_locator}`} prefetch={false}>
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
    path: "ytd_fatal_crash",
    label: "YTD Fatal Crash",
    sortable: true,
  },
  {
    path: "ytd_fatality",
    label: "YTD Fatality",
    sortable: true,
  },
  {
    path: "law_enforcement_ytd_fatality_num",
    label: "LE #",
    sortable: true,
  },
  {
    path: "crash_date_ct",
    label: "Crash Date",
    sortable: true,
    valueFormatter: formatDate,
    style: { whiteSpace: "nowrap" },
  },
  {
    path: "location",
    label: "Location",
    sortable: true,
    style: { whiteSpace: "nowrap" },
  },
  {
    path: "victim_name",
    label: "Victim Name",
    sortable: true,
    style: { whiteSpace: "nowrap" },
  },
  {
    path: "recommendation.atd__recommendation_status_lkp.rec_status_desc",
    label: "FRB Status",
    style: { whiteSpace: "nowrap" },
    sortable: true,
  },
  {
    path: "recommendation.rec_text",
    label: "FRB Recommendation",
    style: { minWidth: "400px", whiteSpace: "pre-wrap" },
    sortable: true,
  },
  {
    path: "engineering_area.atd_engineer_areas",
    label: "Engineering Area",
    sortable: true,
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
    path: "crash_timestamp",
    label: "crash_timestamp",
    exportOnly: true,
    fetchAlways: true,
  },
  {
    path: "address_primary",
    label: "address_primary",
    exportOnly: true,
    fetchAlways: true,
  },
];
