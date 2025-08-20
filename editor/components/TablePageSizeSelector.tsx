import { Dispatch, SetStateAction } from "react";
import { QueryConfig } from "@/types/queryBuilder";
import Form from "react-bootstrap/form";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { produce } from "immer";
import { ALLOWED_QUERY_PAGE_SIZES, AllowedPageSize } from "@/utils/constants";

interface TablePageSizeSelectorProps {
  /**
   * The graphql query configuration
   */
  queryConfig: QueryConfig;
  /**
   * Sets the queryConfig
   */
  setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
}

/**
 * Table component that controls column visibility
 */
export default function TablePageSizeSelector({
  queryConfig,
  setQueryConfig,
}: TablePageSizeSelectorProps) {
  return (
    <div className="my-auto me-2">
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id="page-left-tooltip">Page size</Tooltip>}
      >
        <Form.Group className="d-flex">
          <Form.Select
            size="sm"
            value={queryConfig.limit}
            className="text-secondary"
            onChange={(e) => {
              const newPageLimit = Number(e.target.value);
              const draftQueryConfig = produce(
                queryConfig,
                (draftQueryConfig) => {
                  // type guard which enables us to assert that the selected page limit is allowed
                  if (
                    !ALLOWED_QUERY_PAGE_SIZES.includes(
                      newPageLimit as AllowedPageSize
                    )
                  ) {
                    return;
                  }
                  draftQueryConfig.limit = newPageLimit as AllowedPageSize;
                  // reset the current offset to return to the 1st page of results
                  draftQueryConfig.offset = 0;
                  return draftQueryConfig;
                }
              );
              setQueryConfig(draftQueryConfig);
            }}
          >
            {ALLOWED_QUERY_PAGE_SIZES.map((value) => (
              <option key={value} value={value}>{value.toLocaleString()}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </OverlayTrigger>
    </div>
  );
}
