import React, { useState, useEffect } from "react";
import {
  Col,
  Button,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButtonDropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
} from "reactstrap";

import { useQuery } from "@apollo/react-hooks";
import { withApollo } from "react-apollo";
import { gql } from "apollo-boost";

// TODO add query operators to each field to better fit data types (_eq, etc.)?
const fieldsToSearch = [
  { rpt_street_name: "Reported Street Name" },
  { crash_id: "Crash ID" },
];

const TableSearchBar = props => {
  const updateResults = props.updateResults;

  const [searchFieldValue, setSearchFieldValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [fieldToSearch, setFieldToSearch] = useState("");

  const addFiltersToQuery = () => {
    let queryWithFilters =
      fieldToSearch !== "" && searchValue !== ""
        ? props.queryString.replace(
            "FILTER",
            `where: { ${fieldToSearch}: { _in: "${searchValue}" } }`
          )
        : props.queryString.replace("FILTER", "");
    return gql`
      ${queryWithFilters}
    `;
  };

  const {
    loading: searchLoading,
    error: searchError,
    data: searchData,
  } = useQuery(addFiltersToQuery());

  useEffect(() => {
    searchValue !== "" && updateResults(searchData, true);
  }, [searchData, searchValue, updateResults]);

  const handleSearchSubmission = e => {
    e.preventDefault();
    setSearchValue(searchFieldValue);
  };

  const handleClearSearchResults = () => {
    props.updateResults("", false);
    setSearchFieldValue("");
    setSearchValue("");
    setFieldToSearch("");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleFieldSelect = e => {
    setFieldToSearch(e.target.value);
  };

  const getFieldName = fieldKey =>
    Object.values(
      fieldsToSearch.find(field => Object.keys(field)[0] === fieldKey)
    );

  return (
    <Form className="form-horizontal" onSubmit={handleSearchSubmission}>
      <FormGroup row>
        <Col md="6">
          <InputGroup>
            <Input
              type="text"
              id="input1-group2"
              name="input1-group2"
              placeholder={"Enter Search Here..."}
              value={searchFieldValue}
              onChange={e => setSearchFieldValue(e.target.value)}
            />
            <InputGroupButtonDropdown
              addonType="prepend"
              isOpen={isDropdownOpen}
              toggle={toggleDropdown}
            >
              <DropdownToggle caret color="secondary">
                {fieldToSearch === "" ? "Field" : getFieldName(fieldToSearch)}
              </DropdownToggle>
              <DropdownMenu>
                {fieldsToSearch.map((field, i) => (
                  <DropdownItem
                    key={i}
                    value={Object.keys(field)}
                    onClick={handleFieldSelect}
                  >
                    {Object.values(field)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </InputGroupButtonDropdown>
            <InputGroupAddon addonType="append">
              <Button type="submit" color="primary">
                <i className="fa fa-search" /> Search
              </Button>
              <Button
                type="button"
                color="danger"
                onClick={handleClearSearchResults}
              >
                <i className="fa fa-ban" /> Clear
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </Col>
      </FormGroup>
    </Form>
  );
};

export default withApollo(TableSearchBar);
