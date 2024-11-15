import { Dispatch, SetStateAction } from "react";
import Button from "react-bootstrap/Button";
import { FaXmark } from "react-icons/fa6";
import { QueryConfig } from "@/utils/queryBuilder";

interface Props {
  queryConfig: QueryConfig;
  setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
}

/**
 * UI component that resets the filter state by
 * setting the queryConfig to its initial value
 */
export default function TableResetFiltersToggle({
  queryConfig,
  setQueryConfig,
}: Props) {
  return (
    <Button
      variant="outline-danger"
      onClick={() => setQueryConfig(queryConfig)}
    >
      <span className="text-nowrap d-flex align-items-center">
        <FaXmark className="me-2" />
        Reset filters
      </span>
    </Button>
  );
}
