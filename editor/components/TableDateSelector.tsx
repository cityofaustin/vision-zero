import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import DatePicker from "react-datepicker";
import { QueryConfig, DateFilterMode } from "@/types/queryBuilder";
import {
  getDateRangeFromDateFilter,
  makeDateFilterFromMode,
  makeDateFilters,
  DateRange,
} from "@/utils/dates";
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

// todo: these are shared props export the interface from elsewhere
interface TableSearchProps {
  queryConfig: QueryConfig;
  setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
}

/**
 * Table UI component which provides date filtering
 */
export default function TableDateSelector({
  queryConfig,
  setQueryConfig,
}: TableSearchProps) {
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [isDatePickerDirty, setIsDatePickerDirty] = useState(false);

  const currentFilter = queryConfig.dateFilter;

  useEffect(() => {
    // keep custom range form in sync with queryConfig
    setCustomDateRange(getDateRangeFromDateFilter(queryConfig));
    setIsDatePickerDirty(false);
  }, [currentFilter, queryConfig]);

  if (!currentFilter) return;

  return (
    <div className="d-flex justify-content-between align-items-center">
      <span className="fw-bold me-2">Date range</span>
      <ButtonToolbar>
        <ButtonGroup className="me-2" aria-label="Date filter preset buttons">
          {buttons.map((button) => (
            <Button
              className="date-preset-button"
              key={button.label}
              active={button.value === currentFilter.mode}
              size="sm"
              onClick={() => {
                if (button.value === currentFilter.mode) {
                  // nothing todo
                  return;
                }

                const newDateFilter = makeDateFilterFromMode(
                  button.value,
                  queryConfig,
                  currentFilter.column
                );

                const newQueryConfig = { ...queryConfig };

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
      {currentFilter.mode === "custom" && (
        <div className="d-flex">
          {/* Date range start */}
          <DatePicker
            toggleCalendarOnIconClick
            className="form-control"
            // setting multiple date formats allows the datepicker
            // to properly parse yyyy-MM-dd when keyed/pasted into the picker
            // this feature is not documented but the type def and code
            // clearly support it
            dateFormat={["MM/dd/yyyy", "yyyy-MM-dd"]}
            onChange={(date) => {
              if (date) {
                // set the hours to the beginning of the date selected
                date.setHours(0, 0, 0, 0);
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
            dateFormat={["MM/dd/yyyy", "yyyy-MM-dd"]}
            onChange={(date) => {
              if (date) {
                // set the hours to the end of the date selected
                date.setHours(23, 59, 59, 999);
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
                  currentFilter.column || "",
                  customDateRange
                );
                const newQueryConfig = { ...queryConfig };
                const newDateFilter: QueryConfig["dateFilter"] = {
                  column: currentFilter.column,
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
