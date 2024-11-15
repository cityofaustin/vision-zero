import { Dispatch, SetStateAction, useMemo } from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import { FaFilter } from "react-icons/fa6";
import { QueryConfig } from "@/utils/queryBuilder";

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

/**
 * Table component that controls advanced search filters
 */
export default function TableAdvancedSearchFilterToggle({
  setIsFilterOpen,
  activeFilterCount,
}: {
  setIsFilterOpen: Dispatch<SetStateAction<boolean>>;
  activeFilterCount: number;
}) {
  return (
    <Button
      className="me-2"
      variant="outline-primary"
      onClick={() =>
        setIsFilterOpen((prevState) => {
          return !prevState;
        })
      }
    >
      <span className="text-nowrap d-flex align-items-center">
        <FaFilter />
        <span className="mx-2">Filters</span>
        {activeFilterCount > 0 && (
          <Badge bg="primary">{activeFilterCount}</Badge>
        )}
      </span>
    </Button>
  );
}
