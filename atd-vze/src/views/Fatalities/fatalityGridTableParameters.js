export const fatalityGridTableColumns = {
  year: {
    searchable: true,
    sortable: true,
    label_table: "Year",
    type: "Int",
  },
  crash_id: {
    searchable: true,
    sortable: true,
    label_table: "Crash ID",
    type: "Int",
  },
  "atd_txdot_crash { case_id }": {
    searchable: true,
    sortable: true,
    label_table: "Case ID",
    type: "Int",
  },
  law_enforcement_num: {
    searchable: true,
    sortable: true,
    label_table: "Law Enforcement Number",
    type: "Int",
  },
  ytd_fatal_crash: {
    searchable: true,
    sortable: true,
    label_table: "YTD Fatal Crashes",
    type: "Int",
  },
  ytd_fatality: {
    searchable: true,
    sortable: true,
    label_table: "YTD Fatalities",
    type: "Int",
  },
  "atd_txdot_crash { crash_date }": {
    searchable: true,
    sortable: true,
    label_table: "Crash Date",
    type: "Date",
  },
  location: {
    searchable: true,
    sortable: true,
    label_table: "Location",
    type: "String",
  },
  victim_name: {
    searchable: true,
    sortable: true,
    label_table: "Victim Name",
    type: "String",
  },
  "atd_txdot_crash { recommendation {recommendation_status_id} }": {
    searchable: true,
    sortable: true,
    label_table: "Current FRB Status",
    type: "String",
  },
  "atd_txdot_crash { recommendation {text} }": {
    searchable: true,
    sortable: true,
    label_table: "FRB Recommendation",
    type: "String",
  },
};
