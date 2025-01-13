import { Dispatch, SetStateAction } from "react";
import { produce } from "immer";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import { QueryConfig } from "@/utils/queryBuilder";
import "react-datepicker/dist/react-datepicker.css";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { HasuraAggregateData } from "@/types/graphql";

interface PaginationControlProps {
  queryConfig: QueryConfig;
  setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
  recordCount: number;
  isLoading: boolean;
  aggregateData?: HasuraAggregateData;
}

/**
 * UI component that controls pagination by setting the
 * QueryConfig offset
 */
export default function TablePaginationControls({
  aggregateData,
  queryConfig,
  setQueryConfig,
  recordCount,
  isLoading,
}: PaginationControlProps) {
  const currentPageNum = queryConfig.offset / queryConfig.limit + 1;
  const totalRecords = aggregateData?.aggregate?.count || 0;

  const pageLeftButtonDisabled =
    recordCount === 0 || queryConfig.offset === 0 || isLoading;
  const pageRightButtonDisabled = recordCount < queryConfig.limit || isLoading;

  return (
    <ButtonToolbar>
      <div className="text-nowrap text-secondary d-flex align-items-center me-2">
        {totalRecords > 0 && (
          <span>{`${totalRecords.toLocaleString()} records`}</span>
        )}
        {totalRecords <= 0 && <span>No results</span>}
      </div>
      <ButtonGroup className="me-2" aria-label="Table pagniation controls">
        <Button
          variant={
            pageLeftButtonDisabled ? "outline-secondary" : "outline-primary"
          }
          style={{ border: "none" }}
          disabled={pageLeftButtonDisabled}
          onClick={() => {
            const newQueryConfig = produce(queryConfig, (newQueryConfig) => {
              newQueryConfig.offset =
                newQueryConfig.offset - newQueryConfig.limit;
              if (newQueryConfig.offset < 0) {
                // shouldn't be possible, but ok
                newQueryConfig.offset = 0;
              }
              return newQueryConfig;
            });
            setQueryConfig(newQueryConfig);
          }}
        >
          <FaAngleLeft />
        </Button>
        <span
          aria-label="Current page number"
          className="btn text-secondary mx-2 text-nowrap"
          style={{ pointerEvents: "none" }}
        >
          {`Page ${currentPageNum}`}
        </span>
        <Button
          variant={
            pageRightButtonDisabled ? "outline-secondary" : "outline-primary"
          }
          style={{ border: "none" }}
          disabled={pageRightButtonDisabled}
          onClick={() => {
            const newQueryConfig = produce(queryConfig, (newQueryConfig) => {
              newQueryConfig.offset =
                newQueryConfig.offset + newQueryConfig.limit;
              return newQueryConfig;
            });
            setQueryConfig(newQueryConfig);
          }}
        >
          <FaAngleRight />
        </Button>
      </ButtonGroup>
    </ButtonToolbar>
  );
}
