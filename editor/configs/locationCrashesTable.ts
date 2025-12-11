import { QueryConfig, FilterGroup } from "@/types/queryBuilder";
import { DEFAULT_QUERY_LIMIT } from "@/utils/constants";
import { getYearsAgoDate, makeDateFilters } from "@/utils/dates";

const locationCrashesFiltercards: FilterGroup[] = [
  {
    id: "primary_filter_card",
    label: "Crash type",
    groupOperator: "_or",
    filterGroups: [
      {
        id: "cr3_crashes",
        label: "CR3 crashes",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "cr3_crashes",
            column: "type",
            operator: "_eq",
            value: "CR3",
          },
        ],
      },
      {
        id: "non_cr3_crashes",
        label: "Non-CR3 crashes",
        groupOperator: "_and",
        enabled: false,
        inverted: false,
        filters: [
          {
            id: "cr3_crashes",
            column: "type",
            operator: "_eq",
            value: "NON-CR3",
          },
        ],
      },
    ],
  },
];

export const locationCrashesQueryConfig: QueryConfig = {
  _version: 1,
  exportable: true,
  exportFilename: "location-crashes",
  tableName: "location_crashes_view",
  limit: DEFAULT_QUERY_LIMIT,
  offset: 0,
  sortColName: "crash_timestamp",
  sortAsc: false,
  searchFilter: {
    id: "search",
    value: "",
    column: "case_id",
    operator: "_ilike",
    wildcard: true,
  },
  searchFields: [
    { label: "Case ID", value: "case_id" },
    { label: "Crash ID", value: "record_locator" },
    { label: "Address", value: "address_display" },
    { label: "Collision type", value: "collsn_desc" },
  ],
  dateFilter: {
    mode: "5y",
    column: "crash_timestamp",
    filters: makeDateFilters("crash_timestamp", {
      start: getYearsAgoDate(5),
      end: null,
    }),
  },
  filterCards: locationCrashesFiltercards,
  mapConfig: {
    isActive: false,
    popupComponentName: "locationTableMap",
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
    mapProps: {
      cooperativeGestures: true,
    },
    geojsonTransformerName: "latLon",
    defaultBasemap: "aerial",
  },
};
