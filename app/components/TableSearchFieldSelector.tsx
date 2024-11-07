import { Dispatch, SetStateAction } from "react";
import Form from "react-bootstrap/Form";
import { QueryConfig } from "@/utils/queryBuilder";

const fields = [
  { label: "Crash ID", value: "record_locator" },
  { label: "Case ID", value: "case_id" },
  { label: "Address", value: "address_primary" },
];

interface TableSearchProps {
  queryConfig: QueryConfig;
  setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
}

export default function TableSearchFieldSelector({
  queryConfig,
  setQueryConfig,
}: TableSearchProps) {
  return (
    <>
      <Form.Label className="fw-bold me-2">Search by </Form.Label>
      {fields.map((field) => {
        return (
          <Form.Check
            key={field.value}
            inline
            label={field.label}
            type="radio"
            checked={queryConfig.searchFilter.column === field.value}
            onChange={() => {
              const newQueryConfig = { ...queryConfig };
              newQueryConfig.searchFilter = {
                ...newQueryConfig.searchFilter,
                column: field.value,
              };
              setQueryConfig(newQueryConfig);
            }}
            id={field.value}
          />
        );
      })}
    </>
  );
}
