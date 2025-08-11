import { Dispatch, SetStateAction, useMemo } from "react";
import Badge from "react-bootstrap/Badge";
import Dropdown from "react-bootstrap/Dropdown";
import TableAdvancedSearchFilterMenu from "@/components/TableAdvancedSearchFilterMenu";
import { FaSliders } from "react-icons/fa6";
import AlignedLabel from "./AlignedLabel";
import { QueryConfig } from "@/types/queryBuilder";

/**
 * Count how many switch filters are present
 *
 * Inverted filters are not counted unless they are disabled 🙃
 */
export const useActiveSwitchFilterCount = (queryConfig: QueryConfig): number =>
  useMemo(() => {
    let activeFilterCount = 0;
    queryConfig.filterCards?.forEach((filterCard) => {
      filterCard.filterGroups?.forEach((switchFilterGroup) => {
        if (
          (switchFilterGroup.enabled && !switchFilterGroup.inverted) ||
          (!switchFilterGroup.enabled && switchFilterGroup.inverted)
        ) {
          activeFilterCount++;
        }
      });
    });
    return activeFilterCount;
  }, [queryConfig]);

export interface TableAdvancedSearchFilterToggleProps {
  queryConfig: QueryConfig;
  setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
  activeFilterCount: number;
}

/**
 * Table component that controls advanced search filters
 */
export default function TableAdvancedSearchFilterToggle({
  queryConfig,
  setQueryConfig,
  activeFilterCount,
}: TableAdvancedSearchFilterToggleProps) {
  return (
    <Dropdown>
      <Dropdown.Toggle className="hide-toggle me-2" variant="outline-primary">
        <AlignedLabel>
          <FaSliders />
          <span className="mx-2">Filters</span>
          {activeFilterCount > 0 && (
            <Badge bg="primary">{activeFilterCount}</Badge>
          )}
        </AlignedLabel>
      </Dropdown.Toggle>
      <Dropdown.Menu
        style={{
          width: "350px",
          // todo: set this based on window size
          maxHeight: "550px",
          overflowY: "scroll",
          overflowX: "hidden",
        }}
      >
        <TableAdvancedSearchFilterMenu
          queryConfig={queryConfig}
          setQueryConfig={setQueryConfig}
        />
      </Dropdown.Menu>
    </Dropdown>
  );
}
