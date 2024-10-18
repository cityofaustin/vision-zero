import React, { useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { useApolloClient } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import {
  Form,
  FormFeedback,
  Input,
  InputGroup,
  InputGroupAddon,
  Button,
  InputGroupButtonDropdown,
  DropdownToggle,
  Spinner,
} from "reactstrap";
import { appCodeName } from "../helpers/environment";

const DEFAULT_GLOBAL_SEARCH_FIELD = "record_locator";
const localStorageKey = `${appCodeName}_global_search_field`;

const CRASH_QUERY = gql`
  query CrashNavigationSearch($searchTerm: String!) {
    record_locator: crashes(
      limit: 2
      where: {
        record_locator: { _eq: $searchTerm }
        is_deleted: { _eq: false }
      }
    ) {
      id
      record_locator
    }
    case_id: crashes(
      limit: 2
      where: { case_id: { _eq: $searchTerm }, is_deleted: { _eq: false } }
    ) {
      id
      record_locator
    }
  }
`;

const CrashNavigationSearchForm = () => {
  // Stores the search input that will be passed to the crash query
  const [searchTerm, setSearchTerm] = useState("");
  // Controls if we are searching by `record_locator` or `case_id`
  const [searchField, setSearchField] = useState(
    localStorage.getItem(localStorageKey) || DEFAULT_GLOBAL_SEARCH_FIELD
  );
  // Stores error validation message when no crashes or multiple crashes are found
  const [searchError, setSearchError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const client = useApolloClient();
  const history = useHistory();

  /**
   * Controls the search field name and keep it in sync with local storage
   */
  const changeSearchField = useCallback(() => {
    setSearchField(prevState => {
      const newSearchField =
        prevState === "record_locator" ? "case_id" : "record_locator";
      localStorage.setItem(localStorageKey, newSearchField);
      return newSearchField;
    });
    setSearchError(null);
  }, []);

  /**
   * Function which queries for crashes and redirects if found
   */
  const onSearch = useCallback(() => {
    setIsLoading(true);
    client
      .query({
        query: CRASH_QUERY,
        variables: { searchTerm: searchTerm },
      })
      .then(json => {
        const results = json.data?.[searchField];
        setIsLoading(false);
        if (results.length === 1) {
          const recordLocator = results[0].record_locator;
          // navigate to crash
          history.push(`/crashes/${recordLocator}`);
          // reset form state
          setSearchTerm("");
          setSearchError(null);
        } else {
          let searchError;

          if (results.length === 0) {
            searchError =
              searchField === "record_locator"
                ? "Crash not found"
                : "Case not found";
          } else {
            searchError = "Multiple results found";
          }
          setSearchError(searchError);
        }
      });
  }, [searchTerm, history, client, searchField]);

  return (
    <Form className="mr-2" onSubmit={e => e.preventDefault()}>
      <InputGroup>
        <InputGroupButtonDropdown
          size="sm"
          addonType="prepend"
          isOpen={false}
          toggle={changeSearchField}
        >
          <DropdownToggle color="secondary">
            {searchField === "record_locator" ? "Crash ID" : "Case ID"}
          </DropdownToggle>
        </InputGroupButtonDropdown>
        <Input
          invalid={!!searchError}
          bsSize="sm"
          type="text"
          name="crash-navigation-search"
          placeholder="Search..."
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value.trim());
            if (searchError) {
              setSearchError(null);
            }
          }}
        />
        <FormFeedback tooltip>{searchError}</FormFeedback>
        <InputGroupAddon addonType="append">
          <Button
            type="submit"
            color={searchTerm ? "primary" : "secondary"}
            disabled={!searchTerm}
            size="sm"
            onClick={onSearch}
          >
            {!isLoading && <i className="fa fa-search" />}
            {isLoading && <Spinner style={{ height: "1rem", width: "1rem" }} />}
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </Form>
  );
};

export default CrashNavigationSearchForm;
