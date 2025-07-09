import { Dispatch, SetStateAction } from "react";
import { produce } from "immer";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import { FaAngleLeft, FaAngleRight, FaDownload } from "react-icons/fa6";
import AlignedLabel from "./AlignedLabel";
import TableSettingsMenu from "@/components/TableSettingsMenu";
import { QueryConfig } from "@/types/queryBuilder";
import { ColumnVisibilitySetting } from "@/types/types";
import "react-datepicker/dist/react-datepicker.css";

interface PaginationControlProps {
  columnVisibilitySettings: ColumnVisibilitySetting[];
  setColumnVisibilitySettings: Dispatch<
    SetStateAction<ColumnVisibilitySetting[]>
  >;
  queryConfig: QueryConfig;
  setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
  recordCount: number;
  totalRecordCount: number;
  isLoading: boolean;
  onClickDownload: () => void;
  exportable: boolean;
  isColVisibilityLocalStorageLoaded: boolean;
  setIsColVisibilityLocalStorageLoaded: Dispatch<SetStateAction<boolean>>;
  localStorageKey: string;
}

/**
 * UI component that controls pagination, export, and column settings
 */
export default function TablePaginationControls({
  columnVisibilitySettings,
  setColumnVisibilitySettings,
  queryConfig,
  setQueryConfig,
  recordCount,
  totalRecordCount,
  isLoading,
  onClickDownload,
  exportable,
  localStorageKey,
  isColVisibilityLocalStorageLoaded,
  setIsColVisibilityLocalStorageLoaded,
}: PaginationControlProps) {
  const currentPageNum = queryConfig.offset / queryConfig.limit + 1;

  const pageLeftButtonDisabled =
    recordCount === 0 || queryConfig.offset === 0 || isLoading;
  const pageRightButtonDisabled =
    totalRecordCount <= queryConfig.limit || isLoading;

  return (
    <ButtonToolbar>
      <div className="text-nowrap text-secondary d-flex align-items-center me-2">
        {totalRecordCount > 0 && (
          <>
            <span className="me-2">{`${totalRecordCount.toLocaleString()} record${
              totalRecordCount === 1 ? "" : "s"
            }`}</span>
            {exportable && (
              <Button
                variant="outline-primary"
                className="border-0"
                onClick={onClickDownload}
              >
                <AlignedLabel>
                  <FaDownload className="me-2" />
                  <span>Download</span>
                </AlignedLabel>
              </Button>
            )}
          </>
        )}
        {totalRecordCount <= 0 && <span>No results</span>}
      </div>
      <ButtonGroup className="me-2" aria-label="Table pagniation controls">
        <Button
          variant={
            pageLeftButtonDisabled ? "outline-secondary" : "outline-primary"
          }
          className="border-0"
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
          className="my-auto text-center text-secondary mx-2 text-nowrap border-0"
        >
          {`Page ${currentPageNum}`}
        </span>
        <Button
          variant={
            pageRightButtonDisabled ? "outline-secondary" : "outline-primary"
          }
          className="border-0"
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
      <TableSettingsMenu
        columnVisibilitySettings={columnVisibilitySettings}
        setColumnVisibilitySettings={setColumnVisibilitySettings}
        localStorageKey={localStorageKey}
        isColVisibilityLocalStorageLoaded={isColVisibilityLocalStorageLoaded}
        setIsColVisibilityLocalStorageLoaded={
          setIsColVisibilityLocalStorageLoaded
        }
      />
    </ButtonToolbar>
  );
}
