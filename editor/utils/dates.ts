import { QueryConfig, DateFilterMode, Filter } from "@/types/queryBuilder";

export type DateRange = {
  start: Date | null;
  end: Date | null;
};

/**
 * Get an array of timestamp isostrings in the format of
 * [<first day of year>, now] - in local time
 */
export const getStartOfYearDate = (): Date => {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
  return yearStart;
};

/**
 * Get start/end DateRange for x years ago @ midnight
 * [now - numYears, null] - in local time
 */
export const getYearsAgoDate = (numYears: number): Date => {
  const targetStartDate = new Date();
  targetStartDate.setFullYear(targetStartDate.getFullYear() - numYears);
  targetStartDate.setHours(0, 0, 0, 0);
  return targetStartDate;
};

/**
 * Returns an array of DateFilters constructed from
 * two dates
 */
export const makeDateFilters = (
  column: string,
  { start, end }: DateRange
): Filter[] => {
  const filters: Filter[] = [];
  if (start) {
    filters.push({
      id: "date_start",
      operator: "_gte",
      value: start.toISOString(),
      column: column,
    });
  }
  if (end) {
    filters.push({
      id: "date_end",
      operator: "_lte",
      value: end.toISOString(),
      column: column,
    });
  }
  return filters;
};

/**
 * Construct a DateRange from a query Filter
 */
export const getDateRangeFromDateFilter = (
  queryConfig: QueryConfig
): DateRange => {
  const filters = queryConfig.dateFilter?.filters || [];
  if (queryConfig.dateFilter?.mode === "all") {
    // build a range 2010 to present - this is to translate `all` mode
    // to `custom` range mode
    return {
      start: new Date(2010, 0, 1, 0, 0, 0),
      end: null,
    };
  } else if (["1y", "5y", "ytd"].includes(queryConfig.dateFilter?.mode || "")) {
    // start date with no end date
    const start = new Date(String(filters[0].value || ""));
    return { start, end: null };
  } else if (queryConfig.dateFilter?.mode === "custom") {
    return {
      // expect to be handling start/end strings
      start:
        typeof filters[0]?.value === "string"
          ? new Date(filters[0].value)
          : null,
      end:
        typeof filters[1]?.value === "string"
          ? new Date(filters[1].value)
          : null,
    };
  } else {
    // not possible - return now, now
    const now = new Date();
    return { start: now, end: now };
  }
};

/**
 * Get a date range or an empty array. A date
 * range being [<isostring>, <isosting>]
 */
export const getDateRange = (
  mode: DateFilterMode,
  queryConfig: QueryConfig
): DateRange => {
  const dateRange: DateRange = { start: null, end: null };
  if (mode === "all") {
    //  no filters needed
    return dateRange;
  } else if (mode === "ytd") {
    dateRange.start = getStartOfYearDate();
  } else if (mode === "1y") {
    dateRange.start = getYearsAgoDate(1);
  } else if (mode === "5y") {
    dateRange.start = getYearsAgoDate(5);
  } else if (mode === "custom") {
    // use any filters in queryConfig
    return getDateRangeFromDateFilter(queryConfig);
  }
  return dateRange;
};

/**
 * Create a new queryConfig.dateFilter based on the provided filter mode
 */
export const makeDateFilterFromMode = (
  mode: DateFilterMode,
  queryConfig: QueryConfig,
  dateColumnName: string
) => {
  const dateRange = getDateRange(mode, queryConfig);

  const newFilters = makeDateFilters(dateColumnName || "", dateRange);

  return {
    column: dateColumnName,
    mode,
    filters: newFilters,
  };
};
