import React, { useState, useCallback, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useLazyQuery, useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import {
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  Button,
  InputGroupButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import { appCodeName } from "../helpers/environment";
import Select from "react-select";

const options = [
  { value: "chocolate", label: "Chocolate" },
  { value: "strawberry", label: "Strawberry" },
  { value: "vanilla", label: "Vanilla" },
];

// captures any non-number except the `t` and `T` (for temp crashes)
const CRASH_ID_EXCLUDE_CHARACTERS_REGEX = /[^\dtT]*/g;

const DEFAULT_GLOBAL_SEARCH_FIELD = "record_locator";
const localStorageKey = `${appCodeName}_global_search_field`;

const QUERY_BY_RECORD_LOCATOR = gql`
  query GlobalRecordLocatorSearch($searchTerm: String!) {
    crashes(limit: 5, where: { record_locator: { _eq: $searchTerm } }) {
      id
      record_locator
    }
  }
`;

const QUERY_BY_CASE_ID = gql`
  query GlobalRecordLocatorSearch($searchTerm: String!) {
    crashes(limit: 5, where: { case_id: { _eq: $searchTerm } }) {
      id
      record_locator
    }
  }
`;

const CrashNavigationSearchForm = () => {
  const [crashSearchId, setCrashSearchId] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [globalSearchField, setGlobalSearchField] = useState(
    localStorage.getItem(localStorageKey) || DEFAULT_GLOBAL_SEARCH_FIELD
  );

  const { loading, data, error } = useQuery(
    globalSearchField === "record_locator"
      ? QUERY_BY_RECORD_LOCATOR
      : QUERY_BY_CASE_ID,
    { variables: { searchTerm: crashSearchId } }
  );

  const history = useHistory();

  const toggleDropdown = useCallback(
    () => setIsDropdownOpen(prevState => !prevState),
    []
  );

  useEffect(() => {
    const options = data?.crashes?.map(crash => ({
      value: crash.record_locator,
      label: crash.record_locator,
    }));
    setSearchResults(options || []);
  }, [data]);

  console.log("LDE", loading, error, data);
  return (
    <Form className="mr-2" onSubmit={e => e.preventDefault()}>
      <InputGroup>
        <InputGroupButtonDropdown
          size="sm"
          addonType="prepend"
          isOpen={false}
          toggle={() => {
            const newGlobalSearchField =
              globalSearchField === "record_locator"
                ? "case_id"
                : "record_locator";
            setGlobalSearchField(newGlobalSearchField);
            localStorage.setItem(localStorageKey, newGlobalSearchField);
          }}
        >
          <DropdownToggle color="secondary">
            {globalSearchField === "record_locator" ? "Crash ID" : "Case ID"}
          </DropdownToggle>
        </InputGroupButtonDropdown>
        <Select
          value={crashSearchId}
          inputValue={crashSearchId}
          onInputChange={(value, action) => {
            if (action.action === "input-change") {
              setCrashSearchId(value);
            }
          }}
          placeholder="Go to..."
          options={searchResults}
          noOptionsMessage={() =>
            globalSearchField === "record_locator"
              ? "Crash ID not found"
              : "Case ID not found"
          }
          isLoading={loading}
          closeMenuOnSelect={false}
          onBlur={() => null}
          styles={{
            container: base => ({ ...base, width: "200px" }),
            control: (base, state) => ({
              ...base,
              borderColor: state.isFocused ? "#80bdff" : "#ced4da",
              //   boxShadow: state.isFocused
              //     ? "0 0 0 0.2rem rgba(0,123,255,.25)"
              //     : "none",
              //   "&:hover": {
              //     borderColor: "#80bdff",
              //   },
              height: "31px",
              fontSize: "0.875rem",
              borderRadius: "0",
            }),
          }}
        />
        {/* <Input
          size="sm"
          type="text"
          name="crash-navigation-search"
          placeholder="Search..."
          value={crashSearchId}
          onChange={e =>
            globalSearchField === "record_locator"
              ? setCrashSearchId(
                  e.target.value.replace(CRASH_ID_EXCLUDE_CHARACTERS_REGEX, "")
                )
              : setCrashSearchId(e.target.value.trim())
          }
        /> */}
        {/* <InputGroupAddon addonType="append">
          <Button
            type="submit"
            color={crashSearchId ? "primary" : "secondary"}
            disabled={!crashSearchId}
            size="sm"
            onClick={() => {
              //   history.push(`/crashes/${crashSearchId}`);
              //   setCrashSearchId("");
              //   searchForCrash({ variables: { searchTerm: crashSearchId } });
            }}
          >
            <i className="fa fa-search" />
          </Button>
        </InputGroupAddon> */}
      </InputGroup>
    </Form>
  );
};

export default CrashNavigationSearchForm;
