import { locationCrashesColumns } from "./locationCrashesColumns";
import { QueryConfig, FilterGroup } from "@/utils/queryBuilder";
import { DEFAULT_QUERY_LIMIT } from "@/utils/constants";

const columns = locationCrashesColumns.map((col) => String(col.path));

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
  columns,
  tableName: "location_crashes_view",
  limit: DEFAULT_QUERY_LIMIT,
  offset: 0,
  sortColName: "crash_date",
  sortAsc: false,
  searchFilter: {
    id: "search",
    value: "",
    column: "address_primary",
    operator: "_ilike",
    wildcard: true,
  },
  searchFields: [
    { label: "Address", value: "address_primary" },
    { label: "Case ID", value: "case_id" },
  ],
  filterCards: locationCrashesFiltercards,
};
