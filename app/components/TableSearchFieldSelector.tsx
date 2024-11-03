import { Dispatch, SetStateAction } from "react";
import Form from "react-bootstrap/Form";
import { QueryConfig } from "@/utils/queryBuilder";

interface TableSearchProps {
    queryConfig: QueryConfig;
    setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
  }

export default function TableSearchFieldSelector({
    queryConfig,
    setQueryConfig,
}: TableSearchProps) {
  return (
    <div className="d-flex mb-1">
      <Form.Check
        inline
        label="Crash ID"
        type="radio"
        checked={queryConfig.searchFilter.column === "record_locator"}
        onChange={() => {
          const newQueryConfig = { ...queryConfig };
          newQueryConfig.searchFilter = {
            ...newQueryConfig.searchFilter,
            column: "record_locator",
          };
          setQueryConfig(newQueryConfig);
        }}
        id="crash_id"
      />
      <Form.Check
        inline
        label="Case ID"
        type="radio"
        checked={queryConfig.searchFilter.column === "case_id"}
        onChange={() => {
          const newQueryConfig = { ...queryConfig };
          newQueryConfig.searchFilter = {
            ...newQueryConfig.searchFilter,
            column: "case_id",
          };
          setQueryConfig(newQueryConfig);
        }}
        id="case_id"
      />
      <Form.Check
        inline
        label="Address"
        type="radio"
        checked={queryConfig.searchFilter.column === "address_primary"}
        onChange={() => {
          const newQueryConfig = { ...queryConfig };
          newQueryConfig.searchFilter = {
            ...newQueryConfig.searchFilter,
            column: "address_primary",
          };
          setQueryConfig(newQueryConfig);
        }}
        id="address_primary"
      />
    </div>
  );
}
