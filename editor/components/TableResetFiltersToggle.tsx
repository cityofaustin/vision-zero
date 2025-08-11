import { Dispatch, SetStateAction } from "react";
import Button from "react-bootstrap/Button";
import { FaXmark } from "react-icons/fa6";
import AlignedLabel from "./AlignedLabel";
import { QueryConfig } from "@/types/queryBuilder";
import { produce } from "immer";

interface Props {
  isMapActive: boolean;
  initialQueryConfig: QueryConfig;
  setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
}

/**
 * UI component that resets the filter state by
 * setting the queryConfig to its initial value
 */
export default function TableResetFiltersToggle({
  isMapActive,
  initialQueryConfig,
  setQueryConfig,
}: Props) {
  return (
    <Button
      variant="outline-secondary"
      onClick={() => {
        if (isMapActive && initialQueryConfig.mapConfig) {
          // prefer map toggle state
          const draftQueryConfig = produce(
            initialQueryConfig,
            (draftQueryConfig) => {
              if (draftQueryConfig.mapConfig) {
                draftQueryConfig.mapConfig.isActive = isMapActive;
              }
              return draftQueryConfig;
            }
          );
          setQueryConfig(draftQueryConfig);
        } else {
          setQueryConfig(initialQueryConfig);
        }
      }}
    >
      <AlignedLabel>
        <FaXmark className="me-2" />
        Reset
      </AlignedLabel>
    </Button>
  );
}
