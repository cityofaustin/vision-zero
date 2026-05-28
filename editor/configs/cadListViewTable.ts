import { getYearsAgoDate, makeDateFilters } from "@/utils/dates";
import { QueryConfig, FilterGroup } from "@/types/queryBuilder";
// todo: enable different page size based on list vs map view
// import { DEFAULT_QUERY_LIMIT } from "@/utils/constants";

const cadListViewfilterCards: FilterGroup[] = [
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
    id: "other_filter_card",
    label: "Other",
    groupOperator: "_and",
    filterGroups: [
      {
        id: "is_canceled_call",
        label: "Include cancelled and dupe calls",
        groupOperator: "_and",
        enabled: true,
        inverted: true,
        filters: [
          {
            id: "is_cancelled_call",
            column: "is_cancelled_call",
            operator: "_eq",
            value: false,
          },
        ],
      },
    ],
  },
];

export const cadListViewQueryConfig: QueryConfig = {
  _version: 1,
  exportable: true,
  exportFilename: "cad_incidents",
  tableName: "cad_incidents",
  limit: 1000,
  offset: 0,
  sortColName: "response_date",
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
    { label: "Incident number", value: "master_incident_number" },
  ],
  dateFilter: {
    mode: "1y",
    column: "response_date",
    filters: makeDateFilters("response_date", {
      start: getYearsAgoDate(1),
      end: null,
    }),
  },
  filterCards: cadListViewfilterCards,
  mapConfig: {
    popupComponentName: "cadTableMap",
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
