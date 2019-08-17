import React, { useState } from "react";
import {
  Col,
  Button,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon
} from "reactstrap";

import { useQuery } from "@apollo/react-hooks";
import { withApollo } from "react-apollo";

const TableSearchBar = props => {
  const [searchFieldValue, setSearchFieldValue] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const {
    loading: searchLoading,
    error: searchError,
    data: searchData
  } = useQuery(props.query, {
    variables: { searchValue: searchValue }
  });
  console.log(searchData);

  const handleSearchSubmission = (e, searchValue) => {
    e.preventDefault();
    console.log(searchData, e, searchValue);
    setSearchValue(searchFieldValue);
    // TODO populate search results in table
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
            <InputGroupAddon addonType="append">
              <Button type="submit" color="primary">
                <i className="fa fa-search" /> Search
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </Col>
      </FormGroup>
    </Form>
  );
};

export default withApollo(TableSearchBar);
