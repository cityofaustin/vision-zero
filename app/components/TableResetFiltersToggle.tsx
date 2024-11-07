import { Dispatch, SetStateAction } from "react";
import Button from "react-bootstrap/Button";
import { FaXmark } from "react-icons/fa6";
import { QueryConfig } from "@/utils/queryBuilder";

interface Props {
  queryConfig: QueryConfig;
  setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
}

/**
 * Table component that controls advanced search filters
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
      <span className="text-nowrap">
        <FaXmark className="me-2" />
        Reset
      </span>
    </Button>
  );
}
