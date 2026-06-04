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
  sortColName: "response_date_earliest",
  sortAsc: false,
  searchFilter: {
    id: "search",
    value: "",
    column: "address_earliest",
    operator: "_ilike",
    wildcard: true,
  },
  searchFields: [{ label: "Address", value: "address_earliest" }],
  dateFilter: {
    mode: "1y",
    column: "response_date_earliest",
    filters: makeDateFilters("response_date_earliest", {
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
