import { getYearsAgoDate, makeDateFilters } from "@/utils/dates";
import { QueryConfig, FilterGroup } from "@/types/queryBuilder";
import { DEFAULT_QUERY_LIMIT } from "@/utils/constants";

const fatalitiesListViewFilterCards: FilterGroup[] = [
  {
    id: "unit_type_filter_card",
    label: "Unit Type",
    groupOperator: "_or",
    filterGroups: [
      {
        id: "motor_vehicle",
        label: "Motor vehicle",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "unit_description",
            column: "unit_desc_id",
            operator: "_eq",
            value: 1,
            relationshipName: "unit",
          },
          {
            id: "vehicle_body_style",
            column: "veh_body_styl_id",
            operator: "_nin",
            value: [71, 90],
            relationshipName: "unit",
          },
        ],
      },
      {
        id: "motorcycle",
        label: "Motorcycle",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "unit_description",
            column: "unit_desc_id",
            operator: "_eq",
            value: 1,
            relationshipName: "unit",
          },
          {
            id: "vehicle_body_style",
            column: "veh_body_styl_id",
            operator: "_in",
            value: [71, 90],
            relationshipName: "unit",
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
            id: "unit_description",
            column: "unit_desc_id",
            operator: "_eq",
            value: 3,
            relationshipName: "unit",
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
            id: "unit_description",
            column: "unit_desc_id",
            operator: "_eq",
            value: 4,
            relationshipName: "unit",
          },
        ],
      },
      {
        id: "scooter_rider",
        label: "E-scooter rider",
        groupOperator: "_or",
        filters: [
          {
            id: "unit_description",
            column: "unit_desc_id",
            operator: "_eq",
            value: 77,
            relationshipName: "unit",
          },
          {
            id: "vehicle_body_style",
            column: "veh_body_styl_id",
            operator: "_eq",
            value: 177,
            relationshipName: "unit",
          },
        ],
      },
    ],
  },
  {
    id: "recommendation_status_filter_card",
    label: "Status",
    groupOperator: "_or",
    filterGroups: [
      {
        id: "open_short_term",
        label: "Open - short-term",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "open_short_term",
            column: "recommendation_status_id",
            operator: "_eq",
            value: 1,
            relationshipName: "recommendation",
          },
        ],
      },
      {
        id: "open_long_term",
        label: "Open - long-term",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "open_long_term",
            column: "recommendation_status_id",
            operator: "_eq",
            value: 2,
            relationshipName: "recommendation",
          },
        ],
      },
      {
        id: "closed_no_action_rec",
        label: "Closed - No action recommended",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "closed_no_action_rec",
            column: "recommendation_status_id",
            operator: "_eq",
            value: 3,
            relationshipName: "recommendation",
          },
        ],
      },
      {
        id: "closed_rec_implemented",
        label: "Closed - Recommendation implemented",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "closed_rec_implemented",
            column: "recommendation_status_id",
            operator: "_eq",
            value: 4,
            relationshipName: "recommendation",
          },
        ],
      },
      {
        id: "closed_no_action_taken",
        label: "Closed - No action taken",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "closed_no_action_taken",
            column: "recommendation_status_id",
            operator: "_eq",
            value: 5,
            relationshipName: "recommendation",
          },
        ],
      },
      {
        id: "none",
        label: "None",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "none",
            column: "recommendation_status_id",
            operator: "_is_null",
            value: true,
            relationshipName: "recommendation",
          },
        ],
      },
    ],
  },

  {
    id: "roadway_system",
    label: "Roadway system",
    groupOperator: "_or",
    filterGroups: [
      {
        id: "on_system",
        label: "On-system",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "onsys_fl_true",
            column: "onsys_fl",
            operator: "_eq",
            value: true,
            relationshipName: "crash",
          },
        ],
      },
      {
        id: "off_system",
        label: "Off-system",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "onsys_fl_false",
            column: "onsys_fl",
            operator: "_eq",
            value: false,
            relationshipName: "crash",
          },
        ],
      },
      // it appears that this column is never null but we're carrying this filter forward from
      // an earlier version of the VZE
      {
        id: "unknown",
        label: "Unknown",
        groupOperator: "_and",
        enabled: false,
        filters: [
          {
            id: "unknown",
            column: "onsys_fl",
            operator: "_is_null",
            value: true,
            relationshipName: "crash",
          },
        ],
      },
    ],
  },
];

export const fatalitiesListViewQueryConfig: QueryConfig = {
  _version: 1,
  exportable: true,
  exportFilename: "fatalities",
  tableName: "fatalities_view",
  limit: DEFAULT_QUERY_LIMIT,
  offset: 0,
  sortColName: "cris_crash_id",
  sortAsc: false,
  searchFilter: {
    id: "search",
    value: "",
    column: "record_locator",
    operator: "_ilike",
    wildcard: true,
  },
  searchFields: [
    { label: "Crash ID", value: "record_locator" },
    { label: "Case ID", value: "case_id" },
    { label: "Location", value: "location" },
    { label: "Victim Name", value: "victim_name" },
  ],
  dateFilter: {
    mode: "1y",
    column: "crash_timestamp",
    filters: makeDateFilters("crash_timestamp", {
      start: getYearsAgoDate(1),
      end: null,
    }),
  },
  filterCards: fatalitiesListViewFilterCards,
  mapConfig: {
    isActive: false,
    layerProps: {
      id: "points-layer",
      type: "circle",
      paint: {
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
        "circle-stroke-color": "#ffffff",
      },
    },
    geojsonTransformerName: "latLon",
  },
};
