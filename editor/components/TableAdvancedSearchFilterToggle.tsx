import { Dispatch, SetStateAction, useMemo, useCallback } from "react";
import Badge from "react-bootstrap/Badge";
import Dropdown from "react-bootstrap/Dropdown";
import TableAdvancedSearchFilterMenu from "@/components/TableAdvancedSearchFilterMenu";
import { useLogUserEvent } from "@/utils/userEvents";
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
  /**
   * If provided, enables logging a user event when filters are opened
   * (e.g., "crashes_list_filters", "fatalities_list_filters")
   */
  eventName?: string;
}

/**
 * Table component that controls advanced search filters
 */
export default function TableAdvancedSearchFilterToggle({
  queryConfig,
  setQueryConfig,
  activeFilterCount,
  eventName,
}: TableAdvancedSearchFilterToggleProps) {
  const logUserEvent = useLogUserEvent();

  const handleToggle = useCallback(
    (isOpen: boolean) => {
      // Log event when the dropdown is opened (not when closed)
      if (isOpen && eventName) {
        logUserEvent(eventName);
      }
    },
    [eventName, logUserEvent]
  );

  return (
    <Dropdown onToggle={handleToggle}>
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
