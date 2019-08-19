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

const TableSearchBar = props => {
  const [searchFieldValue, setSearchFieldValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    loading: searchLoading,
    error: searchError,
    data: searchData,
  } = useQuery(props.query, {
    variables: { searchValue: searchValue },
  });
  console.log(searchData);

  useEffect(() => {
    searchValue !== "" && props.updateResults(searchData, true);
  }, [searchData]);

  const handleSearchSubmission = (e, searchValue) => {
    e.preventDefault();
    console.log(searchData, e, searchValue);
    setSearchValue(searchFieldValue);
  };

  const handleClearSearchResults = () => {
    props.updateResults("", false);
    setSearchFieldValue("");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <Form
      className="form-horizontal"
      onSubmit={e => handleSearchSubmission(e, searchFieldValue)}
    >
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
            {/* TODO Add field choice to dynamic query */}
            <InputGroupButtonDropdown
              addonType="prepend"
              isOpen={isDropdownOpen}
              toggle={toggleDropdown}
            >
              <DropdownToggle caret color="secondary">
                Field
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem>Action</DropdownItem>
                <DropdownItem>Another Action</DropdownItem>
                <DropdownItem>Something else here</DropdownItem>
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
