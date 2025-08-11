import { Dispatch, SetStateAction } from "react";
import { produce } from "immer";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { FaAngleLeft, FaAngleRight, FaDownload } from "react-icons/fa6";
import AlignedLabel from "./AlignedLabel";
import TableColumnVisibilityMenu from "@/components/TableColumnVisibilityMenu";
import { QueryConfig } from "@/types/queryBuilder";
import { ColumnVisibilitySetting } from "@/types/types";

interface PaginationControlProps {
  /**
   *  Array of columns and their visibility settings
   */
  columnVisibilitySettings: ColumnVisibilitySetting[];
  /**
   * Sets the column visibility settings
   */
  setColumnVisibilitySettings: Dispatch<
    SetStateAction<ColumnVisibilitySetting[]>
  >;
  /**
   * The graphql query configuration
   */
  queryConfig: QueryConfig;
  /**
   * Sets the queryConfig
   */
  setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
  /**
   * The number of records displayed on the page
   */
  recordCount: number;
  /**
   * The total number of records that match the query
   */
  totalRecordCount: number;
  /**
   * Are the query results loading
   */
  isLoading: boolean;
  /**
   * Function that opens the export modal when download button is clicked
   */
  onClickDownload: () => void;
  /**
   * Should the table have the download button
   */
  exportable: boolean;
  /**
   * Has the local storage item for column visibility been loaded
   */
  isColVisibilityLocalStorageLoaded: boolean;
  /**
   * Set whether the column visibility local storage item has loaded
   */
  setIsColVisibilityLocalStorageLoaded: Dispatch<SetStateAction<boolean>>;
  /**
   * The key to use when saving and loading table data to local storage
   */
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
  const pageLeftButtonDisabled =
    recordCount === 0 || queryConfig.offset === 0 || isLoading;

  const pageRightButtonDisabled =
    totalRecordCount <= queryConfig.offset + queryConfig.limit || isLoading;

  const currentPageRowRange = [
    queryConfig.offset + 1,
    Math.min(totalRecordCount, queryConfig.offset + queryConfig.limit),
  ];

  return (
    <ButtonToolbar>
      <div className="text-nowrap text-secondary d-flex align-items-center me-2">
        {totalRecordCount > 0 && (
          <>
            <span>{`Showing ${currentPageRowRange[0].toLocaleString()}-${currentPageRowRange[1].toLocaleString()} of ${totalRecordCount.toLocaleString()} results`}</span>
          </>
        )}
        {totalRecordCount <= 0 && <span>No results</span>}
      </div>
      <ButtonGroup className="me-2" aria-label="Table pagniation controls">
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id="page-left-tooltip">Prev page</Tooltip>}
        >
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
        </OverlayTrigger>
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id="page-right-tooltip">Next page</Tooltip>}
        >
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
        </OverlayTrigger>
      </ButtonGroup>

      {exportable && (
        <OverlayTrigger
          placement="top"
          //   delay={{ show: 250, hide: 400 }}
          overlay={<Tooltip id="download-tooltip">Download</Tooltip>}
        >
          <Button
            variant="outline-primary"
            className="border-0 me-2"
            onClick={onClickDownload}
            title="Download results"
          >
            <AlignedLabel>
              <FaDownload />
            </AlignedLabel>
          </Button>
        </OverlayTrigger>
      )}

      <TableColumnVisibilityMenu
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
