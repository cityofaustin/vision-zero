import { getYearsAgoDate, makeDateFilters } from "@/utils/dates";
import { QueryConfig, FilterGroup } from "@/types/queryBuilder";

const emsCrashesListViewFilterCards: FilterGroup[] = [
  {
    id: "injuries_filter_card",
    label: "Injuries",
    groupOperator: "_or",
    filterGroups: [
      {
        id: "vz_fatality_records",
        label: "Fatal injuries - Vision Zero",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "vz_fatality_records",
            column: "vz_fatality_count",
            operator: "_gt",
            value: 0,
          },
        ],
      },
      {
        id: "suspected_serious_injury_records",
        label: "Suspected serious injuries",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "suspected_serious_injury_records",
            column: "sus_serious_injry_count",
            operator: "_gt",
            value: 0,
          },
        ],
      },
      {
        id: "suspected_minor_injury_records",
        label: "Suspected minor injuries",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "suspected_minor_injury_records",
            column: "nonincap_injry_count",
            operator: "_gt",
            value: 0,
          },
        ],
      },
    ],
  },
  {
    id: "units_filter_card",
    label: "Units involved",
    groupOperator: "_or",
    filterGroups: [
      {
        id: "motor_vehicle",
        label: "Motor vehicle",
        groupOperator: "_or",
        enabled: false,
        filters: [
          {
            id: "motor_vehicle_wildcard",
            column: "units_involved",
            operator: "_ilike",
            value: "vehicle",
            wildcard: true,
          },
          {
            id: "passenger_wildcard",
            column: "units_involved",
            operator: "_ilike",
            value: "passenger",
            wildcard: true,
          },
        ],
      },
      {
        id: "cyclist",
        label: "Cyclist",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "cyclist_wildcard",
            column: "units_involved",
            operator: "_ilike",
            value: "bicycle",
            wildcard: true,
          },
        ],
      },
      {
        id: "pedestrian",
        label: "Pedestrian",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "pedestrian_wildcard",
            column: "units_involved",
            operator: "_ilike",
            value: "pedestrian",
            wildcard: true,
          },
        ],
      },
      {
        id: "scooter_rider",
        label: "E-scooter rider",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "scooter_rider_wildcard",
            column: "units_involved",
            operator: "_ilike",
            value: "e-scooter",
            wildcard: true,
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
  {
    id: "internal_filters",
    label: "Internal",
    groupOperator: "_and",
    filterGroups: [
      {
        id: "ems_records_only",
        label: "EMS records only",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "ems_records_only",
            column: "record_table_name",
            operator: "_eq",
            value: "ems__incidents",
          },
        ],
      },
      {
        id: "crash_reports_only",
        label: "Crash reports only",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "crash_reports_only",
            column: "record_table_name",
            operator: "_eq",
            value: "crashes",
          },
        ],
      },
      {
        id: "has_ems_override",
        label: "Has EMS override",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "has_ems_override",
            column: "has_ems_override",
            operator: "_eq",
            value: true,
          },
        ],
      },
      {
        id: "fully_matched",
        label: "Fully matched",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "fully_matched",
            column: "injured_people_match_status",
            operator: "_eq",
            value: "fully_matched",
          },
        ],
      },
      {
        id: "partially_matched",
        label: "Partially matched",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "partially_matched",
            column: "injured_people_match_status",
            operator: "_eq",
            value: "mixed",
          },
        ],
      },
      {
        id: "fully_unmatched",
        label: "Fully unmatched",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "fully_unmatched",
            column: "injured_people_match_status",
            operator: "_eq",
            value: "unmatched",
          },
        ],
      },
      {
        id: "exclude_recent_ems_records",
        label: "EMS records > 14 days old",
        // "exclude EMS records that are recent" is `NOT (is_ems AND recent)`,
        // which by De Morgan's is `(not is_ems) OR (older than 14 days)` -
        // this leaves non-EMS (crash report) records untouched regardless
        // of their age
        groupOperator: "_or",
        enabled: false,
        filters: [
          {
            id: "exclude_recent_ems_records_not_ems",
            column: "record_table_name",
            operator: "_neq",
            value: "ems__incidents",
          },
          {
            id: "exclude_recent_ems_records_older_than_cutoff",
            column: "record_timestamp",
            operator: "_lt",
            value: "",
            relativeDays: 14,
          },
        ],
      },
    ],
  },
];

export const emsCrashesListViewQueryConfig: QueryConfig = {
  _version: 1,
  exportable: true,
  exportFilename: "ems_crashes",
  tableName: "crashes_ems_list_view",
  limit: 1000,
  offset: 0,
  sortColName: "record_timestamp",
  sortAsc: false,
  searchFilter: {
    id: "search",
    value: "",
    column: "record_address",
    operator: "_ilike",
    wildcard: true,
  },
  searchFields: [
    { label: "Address", value: "record_address" },
    { label: "Record ID", value: "record_locator" },
    { label: "Case ID", value: "case_id" },
  ],
  dateFilter: {
    mode: "1y",
    column: "record_timestamp",
    filters: makeDateFilters("record_timestamp", {
      start: getYearsAgoDate(1),
      end: null,
    }),
  },
  filterCards: emsCrashesListViewFilterCards,
  mapConfig: {
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
    geojsonTransformerName: "latLon",
    defaultBasemap: "streets",
  },
};
