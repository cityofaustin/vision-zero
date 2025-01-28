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
    path: "recommendation.rec_text",
    label: "FRB Recommendation",
    style: { minWidth: "400px" },
    sortable: true,
  },
  {
    path: "engineering_area.atd_engineer_areas",
    label: "Engineering Area",
    sortable: true,
  },
];
