import { Dispatch, SetStateAction } from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import { FaFilter } from "react-icons/fa6";

/**
 * Table component that controls advanced search filters
 */
export default function TableAdvancedSearchFilterToggle({
  setIsFilterOpen,
  filterCount,
}: {
  setIsFilterOpen: Dispatch<SetStateAction<boolean>>;
  filterCount: number;
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
        {filterCount > 0 && <Badge bg="primary">{filterCount}</Badge>}
      </span>
    </Button>
  );
}
