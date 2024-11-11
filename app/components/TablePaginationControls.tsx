import { Dispatch, SetStateAction } from "react";
import { produce } from "immer";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import Spinner from "react-bootstrap/Spinner";
import { QueryConfig } from "@/utils/queryBuilder";
import "react-datepicker/dist/react-datepicker.css";
import { FaCircleArrowRight, FaCircleArrowLeft } from "react-icons/fa6";

interface PaginationControlProps {
  queryConfig: QueryConfig;
  setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
  recordCount: number;
  isLoading: boolean;
}

const getCurrentPageNumber = (offset: number, limit: number): number =>
  offset / limit + 1;

export default function TablePaginationControls({
  queryConfig,
  setQueryConfig,
  recordCount,
  isLoading,
}: PaginationControlProps) {
  const currentPageNum = getCurrentPageNumber(
    queryConfig.offset,
    queryConfig.limit
  );

  return (
    <ButtonToolbar>
      <ButtonGroup className="me-2" aria-label="Date filter preset buttons">
        <Button
          variant="outline-primary"
          disabled={recordCount === 0 || queryConfig.offset === 0 || isLoading}
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
          <span className="text-nowrap d-flex align-items-center">
            <FaCircleArrowLeft />
            <span className="ms-2">Prev</span>
          </span>
        </Button>
        <Button variant="outline-primary" style={{ pointerEvents: "none" }}>
          {!isLoading && (
            <span className="mx-2">{`Page ${currentPageNum}`}</span>
          )}
          {isLoading && <Spinner size="sm" variant="primary" />}
        </Button>
        <Button
          variant="outline-primary"
          disabled={recordCount < queryConfig.limit || isLoading}
          onClick={() => {
            const newQueryConfig = produce(queryConfig, (newQueryConfig) => {
              newQueryConfig.offset =
                newQueryConfig.offset + newQueryConfig.limit;
              return newQueryConfig;
            });
            setQueryConfig(newQueryConfig);
          }}
        >
          <span className="text-nowrap d-flex align-items-center">
            <span className="me-2">Next</span>
            <FaCircleArrowRight />
          </span>
        </Button>
      </ButtonGroup>
    </ButtonToolbar>
  );
}
