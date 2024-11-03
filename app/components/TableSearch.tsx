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
        onChange={(e) => setSearchString(e.target.value)}
        value={searchString}
        type="search"
      />
      <Button
        onClick={() => {
          const newSearchString = searchString.trim();
          const newQueryConfig = { ...queryConfig };
          newQueryConfig.searchFilter = {
            ...newQueryConfig.searchFilter,
            value: newSearchString,
          };
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
