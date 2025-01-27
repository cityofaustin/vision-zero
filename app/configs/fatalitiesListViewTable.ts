import {
  getYearsAgoDate,
  makeDateFilters,
} from "@/components/TableDateSelector";
import { fatalitiesListViewColumns } from "@/configs/fatalitiesListViewColumns";
import { QueryConfig, FilterGroup } from "@/types/queryBuilder";
import { DEFAULT_QUERY_LIMIT } from "@/utils/constants";

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
    { label: "Crash ID", value: "record_locator" },
    { label: "Case ID", value: "case_id" },
    { label: "Location", value: "location" },
    { label: "Victim Name", value: "victim_name" },
  ],
  dateFilter: {
    mode: "1y",
    column: "crash_date_ct",
    filters: makeDateFilters("crash_date_ct", {
      start: getYearsAgoDate(1),
      end: null,
    }),
  },
  filterCards: fatalitiesListViewFilterCards,
};
