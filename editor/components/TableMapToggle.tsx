import { Dispatch, SetStateAction } from "react";
import Button from "react-bootstrap/Button";
import { FaMapPin, FaTableCells } from "react-icons/fa6";
import AlignedLabel from "./AlignedLabel";
import { QueryConfig } from "@/types/queryBuilder";
import { ButtonGroup } from "react-bootstrap";
import { produce } from "immer";

export interface TableMapToggleProps {
  queryConfig: QueryConfig;
  setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
}

/**
 * Table component that controls advanced search filters
 */
export default function TableMapToggle({
  queryConfig,
  setQueryConfig,
}: TableMapToggleProps) {
  return (
    <ButtonGroup>
      {/* list toggle */}
      <Button
        variant={
          !queryConfig.mapConfig?.isActive ? "primary" : "outline-primary"
        }
        onClick={() => {
          if (!queryConfig.mapConfig?.isActive || !queryConfig.mapConfig) {
            // nothing todo
            return;
          }
          const newQueryConfig = produce(queryConfig, (newQueryConfig) => {
            if (newQueryConfig.mapConfig) {
              newQueryConfig.mapConfig.isActive = false;
            }
            return newQueryConfig;
          });
          setQueryConfig(newQueryConfig);
        }}
      >
        <AlignedLabel>
          <FaTableCells />
          <span className="mx-2">List</span>
        </AlignedLabel>
      </Button>
      {/* map toggle */}
      <Button
        variant={
          queryConfig.mapConfig?.isActive ? "primary" : "outline-primary"
        }
        onClick={() => {
          if (queryConfig.mapConfig?.isActive) {
            // nothing todo
            return;
          }
          const newQueryConfig = produce(queryConfig, (newQueryConfig) => {
            if (newQueryConfig.mapConfig) {
              newQueryConfig.mapConfig.isActive = true;
            }
            return newQueryConfig;
          });
          setQueryConfig(newQueryConfig);
        }}
      >
        <AlignedLabel>
          <FaMapPin />
          <span className="mx-2">Map</span>
        </AlignedLabel>
      </Button>
    </ButtonGroup>
  );
}
