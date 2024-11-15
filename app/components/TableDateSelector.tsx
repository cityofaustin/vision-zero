import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import DatePicker from "react-datepicker";
import { QueryConfig, DateFilterMode, Filter } from "@/utils/queryBuilder";
import "react-datepicker/dist/react-datepicker.css";

type DateRange = {
  start: Date | null;
  end: Date | null;
};

interface DateSelectButton {
  label: string;
  value: DateFilterMode;
}
const buttons: DateSelectButton[] = [
  {
    label: "YTD",
    value: "ytd",
  },
  { label: "1Y", value: "1y" },
  { label: "5Y", value: "5y" },
  { label: "All", value: "all" },
  { label: "Custom", value: "custom" },
];

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
 * Get start/end DateRange for x years ago
 * [now - numYears, null] - in local time
 */
const getYearsAgoDate = (numYears: number): Date => {
  const targetStartDate = new Date();
  targetStartDate.setFullYear(targetStartDate.getFullYear() - numYears);
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

// todo: these are shared props export the interface from elsewhere
interface TableSearchProps {
  queryConfig: QueryConfig;
  setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
}

/**
 * Construct a DateRange from a quey Filter
 */
const getDateRangeFromDateFilter = (queryConfig: QueryConfig): DateRange => {
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
const getDateRange = (
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

export default function TableDateSelector({
  queryConfig,
  setQueryConfig,
}: TableSearchProps) {
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [isDatePickerDirty, setIsDatePickerDirty] = useState(false);

  const filter = queryConfig.dateFilter;

  useEffect(() => {
    // keep custom range form in sync with queryConfig
    setCustomDateRange(getDateRangeFromDateFilter(queryConfig));
    setIsDatePickerDirty(false);
  }, [filter, queryConfig]);

  if (!filter) return;

  return (
    <div className="d-flex justify-content-between align-items-center">
      <span className="fw-bold me-2">Date range</span>
      <ButtonToolbar>
        <ButtonGroup className="me-2" aria-label="Date filter preset buttons">
          {buttons.map((button) => (
            <Button
              key={button.label}
              variant="light"
              active={button.value === filter.mode}
              onClick={() => {
                if (button.value === filter.mode) {
                  // nothing todo
                  return;
                }
                const dateRange = getDateRange(button.value, queryConfig);

                const newFilters = makeDateFilters(
                  filter.column || "",
                  dateRange
                );
                const newQueryConfig = { ...queryConfig };
                const newDateFilter = {
                  column: filter.column,
                  mode: button.value,
                  filters: newFilters,
                };
                newQueryConfig.dateFilter = newDateFilter;
                // reset offset / pagination
                newQueryConfig.offset = 0;
                setQueryConfig(newQueryConfig);
              }}
            >
              {button.label}
            </Button>
          ))}
        </ButtonGroup>
      </ButtonToolbar>
      {filter.mode === "custom" && (
        <div className="d-flex">
          {/* Date range start */}
          <DatePicker
            toggleCalendarOnIconClick
            className="form-control"
            onChange={(date) => {
              if (date) {
                setCustomDateRange({
                  start: date,
                  end: customDateRange.end,
                });
                setIsDatePickerDirty(true);
              }
            }}
            selected={
              customDateRange.start ? customDateRange.start : new Date()
            }
            showIcon
          />
          {/* Date range end */}
          <DatePicker
            toggleCalendarOnIconClick
            className="form-control"
            onChange={(date) => {
              if (date) {
                setCustomDateRange({
                  start: customDateRange.start,
                  end: date,
                });
                setIsDatePickerDirty(true);
              }
            }}
            // todo: use a hook to keep these Date objects memoized?
            selected={customDateRange.end ? customDateRange.end : new Date()}
            showIcon
          />
          {isDatePickerDirty && (
            <Button
              variant="outline-primary"
              onClick={() => {
                const newFilters = makeDateFilters(
                  filter.column || "",
                  customDateRange
                );
                const newQueryConfig = { ...queryConfig };
                const newDateFilter: QueryConfig["dateFilter"] = {
                  column: filter.column,
                  mode: "custom",
                  filters: newFilters,
                };
                newQueryConfig.dateFilter = newDateFilter;
                // reset offset / pagination
                newQueryConfig.offset = 0;
                setQueryConfig(newQueryConfig);
                setIsDatePickerDirty(false);
              }}
            >
              Apply
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
