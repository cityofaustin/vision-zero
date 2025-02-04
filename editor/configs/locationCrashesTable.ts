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
    { label: "Primary address", value: "address_primary" },
    { label: "Secondary address", value: "address_secondary" },
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
};
