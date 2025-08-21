import { Dispatch, SetStateAction } from "react";
import { produce } from "immer";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { QueryConfig } from "@/types/queryBuilder";

export interface TableSearchProps {
  queryConfig: QueryConfig;
  setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
  searchSettings: SearchSettings;
  setSearchSettings: Dispatch<SetStateAction<SearchSettings>>;
}

export interface SearchSettings {
  searchString: string;
  searchColumn: string;
}

/**
 * Record search component that plugs into the query builder
 */
export default function TableSearch({
  queryConfig,
  setQueryConfig,
  searchSettings,
  setSearchSettings,
}: TableSearchProps) {
  return (
    <InputGroup className="d-flex flex-nowrap align-self-start">
      <InputGroup.Text id="search-icon">
        <FaMagnifyingGlass />
      </InputGroup.Text>
      <Form.Control
        placeholder="Search..."
        aria-label="Crash search"
        aria-describedby="search-icon"
        onChange={(e) => {
          if (e.target.value === "") {
            /**
             * trigger a new query to be built when the search input is cleared
             * otherwise user would need to click "submit" again
             */
            const newQueryConfig = produce(queryConfig, (newQueryConfig) => {
              newQueryConfig.searchFilter.value = "";
              newQueryConfig.searchFilter.column = searchSettings.searchColumn;
              // reset offset / pagination
              newQueryConfig.offset = 0;
              return newQueryConfig;
            });
            setQueryConfig(newQueryConfig);
          }
          searchSettings.searchString = e.target.value;
          setSearchSettings({ ...searchSettings });
        }}
        value={searchSettings.searchString}
        type="search"
      />
      <Button
        disabled={
          (queryConfig.searchFilter.value === searchSettings.searchString &&
            queryConfig.searchFilter.column === searchSettings.searchColumn) ||
          // this second case keeps the search button disabled when switching search columns
          // when the input is empty
          (queryConfig.searchFilter.value === searchSettings.searchString &&
            searchSettings.searchString === "")
        }
        onClick={() => {
          const newSearchString = searchSettings.searchString.trim();
          const newQueryConfig = produce(queryConfig, (newQueryConfig) => {
            newQueryConfig.searchFilter.value = newSearchString;
            newQueryConfig.searchFilter.column = searchSettings.searchColumn;
            // reset offset / pagination
            newQueryConfig.offset = 0;
            return newQueryConfig;
          });
          // save new filter state
          setQueryConfig(newQueryConfig);
        }}
        type="submit"
      >
        Search
      </Button>
    </InputGroup>
  );
}
