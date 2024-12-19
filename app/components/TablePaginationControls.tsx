import { Dispatch, SetStateAction } from "react";
import { produce } from "immer";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import AlignedLabel from "./AlignedLabel";
import { QueryConfig } from "@/utils/queryBuilder";
import "react-datepicker/dist/react-datepicker.css";
import { FaCircleArrowRight, FaCircleArrowLeft } from "react-icons/fa6";

interface PaginationControlProps {
  queryConfig: QueryConfig;
  setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
  recordCount: number;
  isLoading: boolean;
}

/**
 * UI component that controls pagination by setting the
 * QueryConfig offset
 */
export default function TablePaginationControls({
  queryConfig,
  setQueryConfig,
  recordCount,
  isLoading,
}: PaginationControlProps) {
  const currentPageNum = queryConfig.offset / queryConfig.limit + 1;
  return (
    <ButtonToolbar>
      <ButtonGroup className="me-2" aria-label="Date filter preset buttons">
        <Button
          variant="outline-primary"
          style={{ border: "none" }}
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
          <AlignedLabel>
            <FaCircleArrowLeft />
            <span className="ms-2">Prev</span>
          </AlignedLabel>
        </Button>
        <Button
          variant="outline-primary"
          style={{ border: "none", pointerEvents: "none" }}
        >
          <span className="mx-2 text-nowrap">{`Page ${currentPageNum}`}</span>
        </Button>
        <Button
          variant="outline-primary"
          style={{ border: "none" }}
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
          <AlignedLabel>
            <span className="me-2">Next</span>
            <FaCircleArrowRight />
          </AlignedLabel>
        </Button>
      </ButtonGroup>
    </ButtonToolbar>
  );
}
