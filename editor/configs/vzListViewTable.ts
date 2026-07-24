import { getYearsAgoDate, makeDateFilters } from "@/utils/dates";
import { QueryConfig, FilterGroup } from "@/types/queryBuilder";

const vzListViewfilterCards: FilterGroup[] = [
  {
    id: "agency_filter_card",
    label: "Agency",
    groupOperator: "_and",
    filterGroups: [
      {
        id: "apd",
        label: "APD",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "apd",
            column: "responding_agencies",
            operator: "_contains",
            value: ["apd"],
          },
        ],
      },
      {
        id: "afd",
        label: "AFD",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "afd",
            column: "responding_agencies",
            operator: "_contains",
            value: ["afd"],
          },
        ],
      },
      {
        id: "ems",
        label: "EMS",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "ems",
            column: "responding_agencies",
            operator: "_contains",
            value: ["ems"],
          },
        ],
      },
      {
        id: "other",
        label: "Other",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "other",
            column: "responding_agencies_str",
            operator: "_nlike",
            value: "%$ems$%",
          },
          {
            id: "other",
            column: "responding_agencies_str",
            operator: "_nlike",
            value: "%$apd$%",
          },
          {
            id: "other",
            column: "responding_agencies_str",
            operator: "_nlike",
            value: "%$afd$%",
          },
        ],
      },
    ],
  },
  {
    id: "crash_report_filter_card",
    label: "Crash report",
    groupOperator: "_and",
    filterGroups: [
      {
        id: "has_crash_report",
        label: "Has crash report",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "has_crash_report",
            column: "record_tables_str",
            operator: "_ilike",
            value: "%$crashes$%",
          },
        ],
      },
      {
        id: "no_crash_report",
        label: "No crash report",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "no_crash_report",
            column: "record_tables_str",
            operator: "_nlike",
            value: "%$crashes$%",
          },
        ],
      },
    ],
  },
  {
    id: "geography_filter_card",
    label: "Jurisdiction",
    groupOperator: "_and",
    filterGroups: [
      {
        id: "in_austin_full_purpose",
        label: "Include outside Austin Full Purpose",
        groupOperator: "_and",
        enabled: true,
        inverted: true,
        filters: [
          {
            id: "in_austin_full_purpose",
            column: "in_austin_full_purpose",
            operator: "_eq",
            value: true,
          },
        ],
      },
    ],
  },
];

export const vzListViewQueryConfig: QueryConfig = {
  _version: 2,
  exportable: true,
  exportFilename: "vz_incidents_list_view",
  tableName: "vz_incidents_list_view",
  limit: 1000,
  offset: 0,
  sortColName: "record_timestamp",
  sortAsc: false,
  searchFilter: {
    id: "search",
    value: "",
    column: "address",
    operator: "_ilike",
    wildcard: true,
  },
  searchFields: [
    { label: "Address", value: "address" },
    { label: "Incident number", value: "incident_numbers_str" },
  ],
  dateFilter: {
    mode: "1y",
    column: "record_timestamp",
    filters: makeDateFilters("record_timestamp", {
      start: getYearsAgoDate(1),
      end: null,
    }),
  },
  filterCards: vzListViewfilterCards,
  mapConfig: {
    popupComponentName: "vzTableMap",
    isActive: false,
    layerProps: {
      id: "points-layer",
      type: "circle",
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          // zoom is 5 (or less)
          5,
          2,
          // zoom is 20 (or greater)
          20,
          10,
        ],
        "circle-color": "#1276d1",
        "circle-stroke-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          // zoom is 5 (or less)
          5,
          1,
          // zoom is 20 (or greater)
          20,
          3,
        ],
        "circle-stroke-color": "#fff",
      },
    },
    geojsonTransformerName: "pointFeature",
    defaultBasemap: "streets",
  },
};
