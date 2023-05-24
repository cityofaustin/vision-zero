export const fatalityGridTableColumns = {
  year: {
    searchable: false,
    sortable: true,
    label_table: "Year",
    type: "Int",
  },
  crash_id: {
    primary_key: true,
    searchable: true,
    sortable: true,
    label_search: "Search by Crash ID",
    label_table: "Crash ID",
    type: "Int",
  },
  case_id: {
    searchable: false,
    sortable: true,
    label_table: "Case ID",
    type: "Int",
  },
  law_enforcement_num: {
    searchable: false,
    sortable: true,
    label_table: "Law Enforcement Number",
    type: "Int",
  },
  ytd_fatal_crash: {
    searchable: false,
    sortable: false,
    label_table: "YTD Fatal Crashes",
    type: "Int",
  },
  ytd_fatality: {
    searchable: false,
    sortable: false,
    label_table: "YTD Fatalities",
    type: "Int",
  },
  crash_date: {
    searchable: false,
    sortable: true,
    label_table: "Crash Date",
    type: "Date",
  },
  location: {
    searchable: false,
    sortable: false,
    label_table: "Location",
    type: "String",
  },
  victim_name: {
    searchable: false,
    sortable: false,
    label_table: "Victim Name",
    type: "String",
  },
  "recommendation { atd__recommendation_status_lkp { rec_status_desc } }": {
    searchable: false,
    sortable: true,
    label_table: "Current FRB Status",
    type: "String",
  },
  "recommendation { rec_text }": {
    searchable: false,
    sortable: false,
    label_table: "FRB Recommendation",
    type: "String",
  },
};

export const fatalityGridTableAdvancedFilters = {
  groupStatus: {
    icon: "map-marker",
    label: "Status",
    filters: [
      {
        id: "status_open_short_term",
        label: "Open - Short Term",
        filter: {
          where: [
            {
              "recommendation: { recommendation_status_id: { _eq: 1 } } ": null,
            },
          ],
        },
      },
      {
        id: "status_open_long_term",
        label: "Open - Long Term",
        filter: {
          where: [
            {
              "recommendation: { recommendation_status_id: { _eq: 2 } } ": null,
            },
          ],
        },
      },
      {
        id: "status_closed_no_action_rec",
        label: "Closed - No Action Recommended",
        filter: {
          where: [
            {
              "recommendation: { recommendation_status_id: { _eq: 3 } } ": null,
            },
          ],
        },
      },
      {
        id: "status_closed_rec_implemented",
        label: "Closed - Recommendation Implemented",
        filter: {
          where: [
            {
              "recommendation: { recommendation_status_id: { _eq: 4 } } ": null,
            },
          ],
        },
      },
      {
        id: "status_closed_no_action_taken",
        label: "Closed - No Action Taken",
        filter: {
          where: [
            {
              "recommendation: { recommendation_status_id: { _eq: 5 } } ": null,
            },
          ],
        },
      },
      {
        id: "status_null",
        label: "Null",
        filter: {
          where: [
            {
              "_not: { recommendation: {recommendation_status_id: { _is_null: false } } }": null,
            },
          ],
        },
      },
    ],
  },
  groupUnits: {
    icon: "bicycle",
    label: "Unit Type",
    filters: [
      {
        id: "cyclist",
        label: "Cyclist",
        filter: {
          where: [
            {
              "_or: [ { person: { unit: { unit_desc_id: { _eq: 3 } } } }, { primaryperson: { unit: { unit_desc_id: { _eq: 3 } } } } ]": null,
            },
          ],
        },
      },
      // {
      //   id: "motorcyclist",
      //   label: "Motorcyclist",
      //   filter: {
      //     where: [
      //       {
      //         "_and: []"
      //       }
      //     ],
      //   },
      // },
    ],
  },
  groupRoad: {
    icon: "road",
    label: "Roadway System",
    filters: [
      {
        id: "on_system",
        label: "On-System",
        filter: {
          where: [
            {
              'crash: { onsys_fl: { _eq: "Y" } }': null,
            },
          ],
        },
      },
      {
        id: "off_system",
        label: "Off-System",
        filter: {
          where: [
            {
              'crash: { onsys_fl: { _eq: "N" } }': null,
            },
          ],
        },
      },
    ],
  },
  // groupRoad: {
  //   icon: "",
  //   label: "Road",
  //   filters: [],
  // },
};
