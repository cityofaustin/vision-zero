import { Dispatch, SetStateAction, useState } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import DatePicker from "react-datepicker";
import { QueryConfig, DateFilter, DateFilterMode } from "@/utils/queryBuilder";
import "react-datepicker/dist/react-datepicker.css";

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
export const getYtdDateRange = (): [string, string] => {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
  return [yearStart.toISOString(), now.toISOString()];
};

/**
 * Get an array of timestamp isostrings in the format of
 * [now - numYears, now] - in local time
 */
const getYearRange = (numYears: number): [string, string] => {
  const targetStartDate = new Date();
  targetStartDate.setFullYear(targetStartDate.getFullYear() - numYears);
  return [targetStartDate.toISOString(), new Date().toISOString()];
};

/**
 * Returns an array of DateFilters constructed from
 * two dates
 */
export const makeDateFilters = (
  column: string,
  dates: [] | [string, string]
): DateFilter[] => {
  return dates.map((dateString, i) => ({
    id: i === 0 ? "start_date" : "end_date",
    operator: i === 0 ? "_gte" : "_lte",
    value: dateString,
    column: column,
  }));
};

// todo: these are shared props export the interface from elsewhere
interface TableSearchProps {
  queryConfig: QueryConfig;
  setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
}

/**
 * Extract the start/end dates from a date filter
 * if exactly two filters are not found, return an array of [now, now]
 */
const getDateRangeFromDateFilter = (
  queryConfig: QueryConfig
): [string, string] => {
  const filterValues = queryConfig.dateFilter?.filters.map((filter) =>
    String(filter.value)
  );
  if (filterValues && filterValues.length === 2) {
    return [filterValues[0], filterValues[1]];
  } else {
    const nowString = new Date().toISOString();
    return [nowString, nowString];
  }
};

export default function TableDateSelector({
  queryConfig,
  setQueryConfig,
}: TableSearchProps) {
  const [customDateRange, setCustomDateRange] = useState<[string, string]>(
    getDateRangeFromDateFilter(queryConfig)
  );
  const filter = queryConfig.dateFilter;
  if (!filter) return;

  const isDatePickerDirty =
    queryConfig.dateFilter?.filters[0]?.value !== customDateRange[0] ||
    queryConfig.dateFilter?.filters[1]?.value !== customDateRange[1];

  return (
    <div className="d-flex justify-content-between">
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
                let dateRange: [] | [string, string] = [];
                if (button.value === "ytd") {
                  dateRange = getYtdDateRange();
                } else if (button.value === "1y") {
                  dateRange = getYearRange(1);
                } else if (button.value === "5y") {
                  dateRange = getYearRange(5);
                } else if (button.value === "all") {
                  //  no filters needed
                  dateRange = [];
                } else {
                  // do anything here for "custom" filter ?
                }
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
          <DatePicker
            autoFocus
            toggleCalendarOnIconClick
            className="form-control"
            onChange={(date) => {
              if (date) {
                setCustomDateRange([date.toISOString(), customDateRange[1]]);
              }
            }}
            selected={new Date(customDateRange[0])}
            showIcon
          />
          <DatePicker
            toggleCalendarOnIconClick
            className="form-control"
            onChange={(date) => {
              if (date) {
                setCustomDateRange([customDateRange[0], date.toISOString()]);
              }
            }}
            selected={new Date(customDateRange[1])}
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
                setQueryConfig(newQueryConfig);
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
