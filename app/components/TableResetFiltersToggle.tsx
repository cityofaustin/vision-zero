import { Dispatch, SetStateAction } from "react";
import Button from "react-bootstrap/Button";
import { FaXmark } from "react-icons/fa6";
import AlignedLabel from "./AlignedLabel";
import { QueryConfig } from "@/types/queryBuilder";

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
      variant="outline-secondary"
      onClick={() => setQueryConfig(queryConfig)}
    >
      <AlignedLabel>
        <FaXmark className="me-2" />
        Reset
      </AlignedLabel>
    </Button>
  );
}
