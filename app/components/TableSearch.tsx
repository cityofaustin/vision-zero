import { Dispatch, SetStateAction, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { QueryConfig } from "@/utils/queryBuilder";

interface TableSearchProps {
  queryConfig: QueryConfig;
  setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
}

/**
 * Update the queryConfig with a new search string
 */
const updateQueryConfigSearch = (
  searchString: string,
  queryConfig: QueryConfig
) => {
  const newQueryConfig = { ...queryConfig };
  newQueryConfig.searchFilter = {
    ...newQueryConfig.searchFilter,
    value: searchString,
  };
  return newQueryConfig;
};

/**
 * Record search component that plugs into the query builder
 */
export default function TableSearch({
  queryConfig,
  setQueryConfig,
}: TableSearchProps) {
  const [searchString, setSearchString] = useState<string>(
    queryConfig.searchFilter.value || ""
  );
  return (
    <InputGroup>
      <InputGroup.Text id="search-icon">
        <FaMagnifyingGlass />
      </InputGroup.Text>
      <Form.Control
        placeholder="Find a crash..."
        aria-label="Crash search"
        aria-describedby="search-icon"
        onChange={(e) => {
          if (e.target.value === "") {
            /** triggers a new query to be built when the search input is cleared
             * otherwise user would need to click "submit" again
             */
            const newQueryConfig = updateQueryConfigSearch("", queryConfig);
            // reset offset / pagination
            newQueryConfig.offset = 0;
            setQueryConfig(newQueryConfig);
          }
          setSearchString(e.target.value);
        }}
        value={searchString}
        type="search"
      />
      <Button
        onClick={() => {
          const newSearchString = searchString.trim();
          const newQueryConfig = updateQueryConfigSearch(
            newSearchString,
            queryConfig
          );
          // reset offset / pagination
          newQueryConfig.offset = 0;
          // save new filter state
          setQueryConfig(newQueryConfig);
          // keep search component in sync with filters
          // (we don't want to trim the search value until submit,
          // otherwise the user cannot input a whitespace character)
          setSearchString(newSearchString);
        }}
      >
        Search
      </Button>
    </InputGroup>
  );
}
