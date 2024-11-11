import {
  getStartOfYearDate,
  makeDateFilters,
} from "@/components/TableDateSelector";
import { crashesListViewColumns } from "@/configs/crashesListView";
import { QueryConfig } from "@/utils/queryBuilder";
import { DEFAULT_QUERY_LIMIT } from "@/utils/constants";
import { getDefaultFilterGroups } from "@/components/TableAdvancedSearchFilterMenu";

const LIST_VIEW_COLUMNS = crashesListViewColumns.map((col) => String(col.name));

export const crashesTableQueryConfig: QueryConfig = {
  columns: LIST_VIEW_COLUMNS,
  tableName: "crashes_list_view",
  limit: DEFAULT_QUERY_LIMIT,
  offset: 0,
  sortColName: "crash_timestamp",
  sortAsc: false,
  searchFilter: {
    id: "search",
    value: "",
    column: "record_locator",
    operator: "_ilike",
    wildcard: true,
  },
  dateFilter: {
    mode: "ytd",
    column: "crash_timestamp",
    filters: makeDateFilters("crash_timestamp", {
      start: getStartOfYearDate(),
      end: null,
    }),
  },
  filterGroups: getDefaultFilterGroups(),
};
