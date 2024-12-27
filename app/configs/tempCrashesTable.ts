import { tempCrashesListViewColumns } from "./tempCrashesListViewColumns";
import { QueryConfig, FilterGroup } from "@/utils/queryBuilder";
import { DEFAULT_QUERY_LIMIT } from "@/utils/constants";

const columns = tempCrashesListViewColumns.map((col) => String(col.path));

const crashesListViewfilterCards: FilterGroup[] = [
  {
    id: "temp_record_filter",
    label: "Temp records",
    groupOperator: "_and",
    filterGroups: [
      {
        id: "is_temp_record",
        label: "Is temp record",
        groupOperator: "_and",
        enabled: true,
        inverted: false,
        filters: [
          {
            id: "is_temp_record",
            column: "is_temp_record",
            operator: "_eq",
            value: true,
          },
          {
            id: "is_deleted",
            column: "is_deleted",
            operator: "_eq",
            value: false,
          },
        ],
      },
    ],
  },
];

export const tempCrashesListViewQueryConfig: QueryConfig = {
  columns,
  tableName: "crashes",
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
    { label: "Address", value: "address_primary" },
  ],
  filterCards: crashesListViewfilterCards,
};
