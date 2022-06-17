export const crashChangesGridTableColumns = {
  record_id: {
    primary_key: true,
    searchable: true,
    sortable: true,
    label_search: "Search by Record ID",
    label_table: "Record ID",
    type: "int",
  },
  change_id: {
    searchable: false,
    sortable: false,
    label_table: "Change ID",
    type: "int",
  },
  sus_serious_injury_cnt: {
    searchable: false,
    sortable: true,
    label_table: "Suspected Serious Injury Count",
    type: "string",
  },
  crash_fatal_flag: {
    searchable: false,
    sortable: true,
    label_table: "Crash Fatality",
    type: "string",
  },
  created_timestamp: {
    searchable: false,
    sortable: true,
    label_table: "Create Date",
    type: "date_iso",
  },
  status_description: {
    searchable: false,
    sortable: true,
    label_table: "Status",
    type: "string",
  },
};
