import { QueryConfig, FilterGroup } from "@/types/queryBuilder";
import { DEFAULT_QUERY_LIMIT } from "@/utils/constants";

const locationsListViewFiltercards: FilterGroup[] = [
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
            column: "council_district",
            operator: "_gt",
            value: 0,
          },
        ],
      },
      {
        id: "location_group",
        label: 'Include "Level 5" polygons',
        groupOperator: "_and",
        enabled: true,
        inverted: true,
        filters: [
          {
            id: "location_group",
            column: "location_group",
            operator: "_eq",
            value: 1,
          },
        ],
      },
    ],
  },
];

export const locationsListViewQueryConfig: QueryConfig = {
  _version: 1,
  exportable: true,
  exportFilename: "locations",
  tableName: "locations_list_view",
  limit: DEFAULT_QUERY_LIMIT,
  offset: 0,
  sortColName: "cr3_crash_count",
  sortAsc: false,
  searchFilter: {
    id: "search",
    value: "",
    column: "location_id",
    operator: "_ilike",
    wildcard: true,
  },
  searchFields: [
    { label: "Location ID", value: "location_id" },
    { label: "Location", value: "description" },
  ],
  filterCards: locationsListViewFiltercards,
};
