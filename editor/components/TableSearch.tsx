import { Dispatch, SetStateAction, useState } from "react";
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
 * Record search component that plugs into the query builder.
 *
 * The input value is kept in local state so keystrokes do not re-render
 * TableWrapper (and the full results table) on every change.
 */
export default function TableSearch({
  queryConfig,
  setQueryConfig,
  searchSettings,
  setSearchSettings,
}: TableSearchProps) {
  const [localSearchString, setLocalSearchString] = useState(
    searchSettings.searchString
  );
  const [prevExternalSearchString, setPrevExternalSearchString] = useState(
    searchSettings.searchString
  );

  // Sync from parent when filters are reset (or search is cleared elsewhere)
  if (searchSettings.searchString !== prevExternalSearchString) {
    setPrevExternalSearchString(searchSettings.searchString);
    setLocalSearchString(searchSettings.searchString);
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex-grow-1">
      <InputGroup className="d-flex flex-nowrap align-self-start">
        <InputGroup.Text id="search-icon">
          <FaMagnifyingGlass />
        </InputGroup.Text>
        <Form.Control
          placeholder="Search..."
          aria-label="Crash search"
          aria-describedby="search-icon"
          onChange={(e) => {
            const value = e.target.value;
            setLocalSearchString(value);
            if (value === "") {
              /**
               * trigger a new query to be built when the search input is cleared
               * otherwise user would need to click "submit" again
               */
              const newQueryConfig = produce(queryConfig, (draft) => {
                draft.searchFilter.value = "";
                draft.searchFilter.column = searchSettings.searchColumn;
                draft.offset = 0;
                return draft;
              });
              setQueryConfig(newQueryConfig);
              setSearchSettings({
                ...searchSettings,
                searchString: "",
              });
            }
          }}
          value={localSearchString}
          type="search"
        />
        <Button
          disabled={
            (queryConfig.searchFilter.value === localSearchString &&
              queryConfig.searchFilter.column ===
                searchSettings.searchColumn) ||
            // this second case keeps the search button disabled when switching search columns
            // when the input is empty
            (queryConfig.searchFilter.value === localSearchString &&
              localSearchString === "")
          }
          onClick={() => {
            const newSearchString = localSearchString.trim();
            setLocalSearchString(newSearchString);
            setSearchSettings({
              ...searchSettings,
              searchString: newSearchString,
            });
            const newQueryConfig = produce(queryConfig, (draft) => {
              draft.searchFilter.value = newSearchString;
              draft.searchFilter.column = searchSettings.searchColumn;
              draft.offset = 0;
              return draft;
            });
            setQueryConfig(newQueryConfig);
          }}
          type="submit"
        >
          Search
        </Button>
      </InputGroup>
    </form>
  );
}
