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
  record_json: {
    searchable: false,
    sortable: true,
    label_table: "Suspected Serious Injury Count",
    type: "string",
    filter: values => {
      const parsedValues = JSON.parse(values);
      return parsedValues.sus_serious_injry_cnt;
    },
  },
  record_json: {
    searchable: false,
    sortable: true,
    label_table: "Crash Fatality",
    type: "string",
    filter: values => {
      const parsedValues = JSON.parse(values);
      return parsedValues.crash_fatal_fl;
    },
  },
  created_timestamp: {
    searchable: false,
    sortable: true,
    label_table: "Create Date",
    type: "date_iso",
  },
  "status { description }": {
    searchable: false,
    sortable: true,
    label_table: "Status",
    type: "string",
  },
};
