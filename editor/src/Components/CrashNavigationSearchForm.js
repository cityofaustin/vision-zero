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

const QUERY_BY_RECORD_LOCATOR = gql`
  query GlobalRecordLocatorSearch($searchTerm: String!) {
    crashes(limit: 1, where: { record_locator: { _eq: $searchTerm } }) {
      id
      record_locator
    }
  }
`;

const QUERY_BY_CASE_ID = gql`
  query GlobalRecordLocatorSearch($searchTerm: String!) {
    crashes(limit: 1, where: { case_id: { _eq: $searchTerm } }) {
      id
      record_locator
    }
  }
`;

const CrashNavigationSearchForm = () => {
  // Stores the search input that will be passed to the crash query
  const [searchTerm, setSearchTerm] = useState("");
  // Setting that controls if we are searching by `record_locator` or `case_id`
  const [globalSearchField, setGlobalSearchField] = useState(
    localStorage.getItem(localStorageKey) || DEFAULT_GLOBAL_SEARCH_FIELD
  );

  const [searchForCrash, { loading, data }] = useLazyQuery(
    globalSearchField === "record_locator"
      ? QUERY_BY_RECORD_LOCATOR
      : QUERY_BY_CASE_ID
  );

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
  }, []);

  /**
   * Hook that redirects to crash page once we have found a
   * cras record
   */
  useEffect(() => {
    const recordLocator = data?.crashes?.[0]?.record_locator;
    if (recordLocator) {
      // we have a crash record - so navigate to it
      history.push(`/crashes/${recordLocator}`);
      setSearchTerm("");
    }
  }, [data, history]);

  /**
   * We can determine that a crash was not found when:
   * - we have a search term
   * - the graphql query is not loading
   * - we have data from the graphql query
   * - there are no items in the data array
   */
  const crashValidationError =
    searchTerm && !loading && data && !data.crashes?.length > 0;

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
          //   type="text"
          name="crash-navigation-search"
          placeholder="Search..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value.trim())}
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
