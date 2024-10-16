import React, { useState, useCallback, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useLazyQuery } from "@apollo/react-hooks";
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
      limit: 1
      where: { record_locator: { _eq: $searchTerm } }
    ) {
      id
      record_locator
    }
    case_id: crashes(limit: 1, where: { case_id: { _eq: $searchTerm } }) {
      id
      record_locator
    }
  }
`;

const CrashNavigationSearchForm = () => {
  // Stores the search input that will be passed to the crash query
  const [searchTerm, setSearchTerm] = useState("");
  // Keeps track of if we have searched the current search term
  const [hasSearchedTerm, setHasSearchedTerm] = useState(false);
  // Setting that controls if we are searching by `record_locator` or `case_id`
  const [globalSearchField, setGlobalSearchField] = useState(
    localStorage.getItem(localStorageKey) || DEFAULT_GLOBAL_SEARCH_FIELD
  );

  const [searchForCrash, { loading, data }] = useLazyQuery(CRASH_QUERY);

  const history = useHistory();

  const changeSearchField = useCallback(() => {
    /**
     * Control the search field name and keep it in sync with local storage
     */
    setGlobalSearchField(prevState => {
      const newGlobalSearchField =
        prevState === "record_locator" ? "case_id" : "record_locator";
      localStorage.setItem(localStorageKey, newGlobalSearchField);
      return newGlobalSearchField;
    });
    setHasSearchedTerm(false);
  }, []);

  const retrievedRecordLocator = data?.[globalSearchField]?.[0]?.record_locator;

  /**
   * Hook that redirects to crash page once we have found a
   * crash record
   */
  useEffect(() => {
    if (retrievedRecordLocator) {
      // navigate to crash
      history.push(`/crashes/${retrievedRecordLocator}`);
      // reset form state
      setSearchTerm("");
      setHasSearchedTerm(false);
    }
  }, [retrievedRecordLocator, history, data]);

  /**
   * We can determine that a crash was not found when:
   * - we have searched for the input
   * - the graphql query is not loading
   * - we have data from the graphql query
   * - there are no items in the data array
   */
  const crashValidationError =
    hasSearchedTerm &&
    !loading &&
    data &&
    !data?.[globalSearchField]?.length > 0;

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
            {globalSearchField === "record_locator" ? "Crash ID" : "Case ID"}
          </DropdownToggle>
        </InputGroupButtonDropdown>
        <Input
          invalid={!!crashValidationError}
          bsSize="sm"
          type="text"
          name="crash-navigation-search"
          placeholder="Search..."
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value.trim());
            setHasSearchedTerm(false);
          }}
        />
        <FormFeedback tooltip>
          {globalSearchField === "record_locator"
            ? "Crash not found"
            : "Case not found"}
        </FormFeedback>
        <InputGroupAddon addonType="append">
          <Button
            type="submit"
            color={searchTerm ? "primary" : "secondary"}
            disabled={!searchTerm}
            size="sm"
            onClick={() => {
              searchForCrash({ variables: { searchTerm: searchTerm } });
              setHasSearchedTerm(true);
            }}
          >
            {!loading && <i className="fa fa-search" />}
            {loading && <Spinner style={{ height: "1rem", width: "1rem" }} />}
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </Form>
  );
};

export default CrashNavigationSearchForm;
