import { Dispatch, SetStateAction } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import { QueryConfig, DateFilter, DateFilterMode } from "@/utils/queryBuilder";

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

export const getYtdDateRange = (): [string, string] => {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
  return [yearStart.toISOString(), now.toISOString()];
};

const getYearRange = (numYears: number): [string, string] => {
  const targetStartDate = new Date();
  targetStartDate.setFullYear(targetStartDate.getFullYear() - numYears);
  return [targetStartDate.toISOString(), new Date().toISOString()];
};

export const makeDateFilters = (
  column: string,
  dates: [string, string]
): DateFilter[] => {
  return dates.map((dateString, i) => ({
    id: i === 0 ? "start_date" : "end_date",
    operator: i === 0 ? "_gte" : "_lte",
    value: dateString,
    column: column,
  }));
};

// const useInitialDateFilters = (queryConfig: QueryConfig) => {
//   // if (queryConfig.dateFilter)
// };

export default function TableDateSelector({
  queryConfig,
  setQueryConfig,
}: TableSearchProps) {

  const filter = queryConfig.dateFilter;
  if (!filter) return;

  return (
    <ButtonToolbar>
      <ButtonGroup className="me-2" aria-label="First group">
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
              let dateRange: undefined | [string, string];
              if (button.value === "ytd") {
                dateRange = getYtdDateRange();
              } else if (button.value === "1y") {
                dateRange = getYearRange(1);
              } else if (button.value === "5y") {
                dateRange = getYearRange(5);
              } else {
                // 'all' and 'custom' not implemented
              }
              if (dateRange) {
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
              } else {
                // todo
              }
            }}
          >
            {button.label}
          </Button>
        ))}
      </ButtonGroup>
    </ButtonToolbar>
  );
}
