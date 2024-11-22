import Form from "react-bootstrap/Form";
import { TableSearchProps } from "./TableSearch";

export default function TableSearchFieldSelector({
  searchSettings,
  setSearchSettings,
  queryConfig,
}: TableSearchProps) {
  // todo: bug here where changing the search field clears the search input if it hasn't been searched
  return (
    <>
      <Form.Label className="fw-bold me-2 mb-0">Search by </Form.Label>
      {queryConfig.searchFields.map((field) => {
        return (
          <Form.Check
            key={field.value}
            inline
            label={field.label}
            type="radio"
            checked={searchSettings.searchColumn === field.value}
            onChange={() => {
              //   const newQueryConfig = { ...queryConfig };
              //   newQueryConfig.searchFilter = {
              //     ...newQueryConfig.searchFilter,
              //     column: field.value,
              //     value: searchSettings.searchString,
              //   };
              //   // reset offset / pagination
              //   newQueryConfig.offset = 0;
              const newSearchSettings = { ...searchSettings };
              newSearchSettings.searchColumn = field.value;
              setSearchSettings(newSearchSettings);
            }}
            id={field.value}
          />
        );
      })}
    </>
  );
}
