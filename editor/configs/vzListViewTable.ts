import { getYearsAgoDate, makeDateFilters } from "@/utils/dates";
import { QueryConfig, FilterGroup } from "@/types/queryBuilder";
// todo: enable different page size based on list vs map view
// import { DEFAULT_QUERY_LIMIT } from "@/utils/constants";

const vzListViewfilterCards: FilterGroup[] = [
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
  _version: 1,
  exportable: true,
  exportFilename: "vz_incidents_view",
  tableName: "vz_incidents_view",
  limit: 1000,
  offset: 0,
  sortColName: "first_response_date",
  sortAsc: false,
  searchFilter: {
    id: "search",
    value: "",
    column: "addresses",
    operator: "_ilike",
    wildcard: true,
  },
  searchFields: [{ label: "Address", value: "address" }],
  dateFilter: {
    mode: "1y",
    column: "first_response_date",
    filters: makeDateFilters("first_response_date", {
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
    geojsonTransformerName: "pointArray",
    defaultBasemap: "streets",
  },
};
