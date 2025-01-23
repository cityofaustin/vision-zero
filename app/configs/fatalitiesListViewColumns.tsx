import Link from "next/link";
import { formatDate } from "@/utils/formatters";
import { ColDataCardDef } from "@/types/types";
import { fatalitiesListRow } from "@/types/fatalitiesList";

export const fatalitiesListViewColumns: ColDataCardDef<fatalitiesListRow>[] = [
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
    path: "law_enforcement_ytd_fatality_num",
    label: "Law Enforcement YTD Fatality Number",
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
    path: "crash_date_ct",
    label: "Crash Date",
    sortable: true,
    valueFormatter: formatDate,
  },
  {
    path: "location",
    label: "Location",
    sortable: true,
  },
  {
    path: "victim_name",
    label: "Victim Name",
    sortable: true,
  },

  // "recommendation { atd__recommendation_status_lkp { rec_status_desc } }": {
  //   searchable: false,
  //   sortable: false,
  //   label_table: "Current FRB Status",
  //   type: "String",
  // },
  // "recommendation { rec_text }": {
  //   searchable: false,
  //   sortable: false,
  //   label_table: "FRB Recommendation",
  //   type: "String",
  // },
  // "engineering_area { atd_engineer_areas }": {
  //   searchable: true,
  //   sortable: true,
  //   label_table: "Current Engineering Area",
  //   type: "String",
  //   label_search: "Current Engineering Area",
  // },
];
