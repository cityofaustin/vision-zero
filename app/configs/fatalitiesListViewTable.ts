import {
  getStartOfYearDate,
  getYearsAgoDate,
  makeDateFilters,
} from "@/components/TableDateSelector";
import { fatalitiesListViewColumns } from "@/configs/fatalitiesListViewColumns";
import { QueryConfig, FilterGroup } from "@/types/queryBuilder";
import { DEFAULT_QUERY_LIMIT } from "@/utils/constants";

const columns = fatalitiesListViewColumns.map((col) => String(col.path));

const fatalitiesListViewFilterCards: FilterGroup[] = [];

export const fatalitiesListViewQueryConfig: QueryConfig = {
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
    // { label: "Crash ID", value: "record_locator" },
    // { label: "Case ID", value: "case_id" },
    // { label: "Address", value: "address_primary" },
  ],
  //   dateFilter: {
  //     mode: "1y",
  //     column: "crash_timestamp",
  //     filters: makeDateFilters("crash_timestamp", {
  //       start: getYearsAgoDate(1),
  //       end: null,
  //     }),
  //   },
  filterCards: fatalitiesListViewFilterCards,
};
