/*
* Configuration for the table view, no need for advanced filters.
* */

export const crashGridTableColumns = {
  atc_crash_id: {
    primary_key: true,
    searchable: true,
    sortable: true,
    label_search: "Search by Crash ID",
    label_table: "Crash ID",
    type: "Int",
  },
  atc_death_cnt: {
    searchable: false,
    sortable: true,
    label_search: "",
    label_table: "Crash Death Count",
    type: "Int",
  },
  atu_death_cnt: {
    searchable: false,
    sortable: true,
    label_search: "",
    label_table: "Unit Death Count",
    type: "Int",
  },
  atp_death_cnt: {
    searchable: false,
    sortable: true,
    label_search: "",
    label_table: "Person Death Count",
    type: "Int",
  },
  atpp_death_cnt: {
    searchable: false,
    sortable: true,
    label_search: "",
    label_table: "Primary Person Death Count",
    type: "Int",
  },

  sus_serious_injry_cnt: {
    searchable: false,
    sortable: true,
    label_table: "Crash Suspected Serious Injury",
    type: "Int",
  },
  atu_sus_serious_injry_cnt: {
    searchable: false,
    sortable: true,
    label_table: "Unit Suspected Serious Injury",
    type: "Int",
  },
  atp_sus_serious_injry_cnt: {
    searchable: false,
    sortable: true,
    label_table: "Person Suspected Serious Injury",
    type: "Int",
  },
  atpp_sus_serious_injry_cnt: {
    searchable: false,
    sortable: true,
    label_table: "Primary Person Suspected Serious Injury",
    type: "Int",
  },
};
