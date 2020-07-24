import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Col,
  Input,
  Label,
  Form,
  FormGroup,
  FormText,
} from "reactstrap";

import { withApollo } from "react-apollo";
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";

import moment from "moment";

import "./CreateCrashRecord.css";

// TODOS:
// - [ ] validate if I'm generating crash IDs in an acceptable way
// - [ ] pass other variables from form into insert mutation
// - [ ] Add field to prod/stag for temp flag, and add to mutation
// - [ ] Create related records
// - [ ] Show success/error states, offer redirect on success
// - [ ] Show exisiting placeholder records in table
// - [ ] Offer delete action for crash record and related records

const CreateCrashRecord = ({ client }) => {
  // console.log(...props);

  /**
   * Handle Create crash record form submit.
   * @param {SyntheticEvent} e - The event object.
   */
  const handleFormSubmit = e => {
    e.preventDefault();

    const INSERT_ONE_CRASH = gql`
      mutation insertOneCrash(
        $crash_id: Int
        $case_id: String
        $crash_fatal_fl: String
        $atd_fatality_count: Int
        $sus_serious_injry_cnt: Int
      ) {
        insert_atd_txdot_crashes_one(
          object: {
            crash_id: $crash_id
            case_id: $case_id
            crash_fatal_fl: $crash_fatal_fl
            atd_fatality_count: $atd_fatality_count
            sus_serious_injry_cnt: $sus_serious_injry_cnt
          }
        ) {
          crash_id
        }
      }
    `;

    // Generate a unique ID to give to the crash record that won't
    // conflict with future Crash IDs from CRIS and that isn't out
    // of bounds for the GraphQL Int type.
    // https://github.com/graphql/graphql-js/issues/292
    const now = Number(moment(new Date()).format("YYMDHmmss"));

    debugger;

    const variables = {
      crash_id: now,
    };

    client
      .mutate({
        mutation: INSERT_ONE_CRASH,
        variables: variables,
      })
      .then(res => {
        console.log(res);
      });
  };

  return (
    <Card>
      <Form onSubmit={e => handleFormSubmit(e)} className="form-horizontal">
        <CardHeader>Create New Crash Record Set</CardHeader>
        <CardBody>
          <FormGroup row>
            <Col md="3">
              <Label htmlFor="hf-email">Case ID</Label>
            </Col>
            <Col xs="12" md="9">
              <Input
                type="number"
                id="hf-case-id"
                name="hf-case-id"
                placeholder="Enter Case ID..."
                // autoComplete="email"
              />
              <FormText className="help-block">
                Please enter the Case ID
              </FormText>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col md="3">
              <Label htmlFor="hf-fatality-count">Fatality Count</Label>
            </Col>
            <Col xs="12" md="9">
              <Input
                type="number"
                id="hf-fatality-count"
                name="hf-fatality-count"
                placeholder="Enter Fatality Count..."
                // autoComplete="current-fatality-count"
              />
              <FormText className="help-block">
                Please enter the Fatality Count
              </FormText>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col md="3">
              <Label htmlFor="hf-fatality-count">
                Suspected Serious Injury Count
              </Label>
            </Col>
            <Col xs="12" md="9">
              <Input
                type="number"
                id="hf-fatality-count"
                name="hf-fatality-count"
                placeholder="Enter Suspected Serious Injury Count..."
                // autoComplete="current-fatality-count"
              />
              <FormText className="help-block">
                Please enter the Suspected Serious Injury Count
              </FormText>
            </Col>
          </FormGroup>
        </CardBody>
        <CardFooter>
          <Button type="submit" size="sm" color="primary" className="mr-2">
            <i className="fa fa-dot-circle-o"></i> Submit
          </Button>
          <Button type="reset" size="sm" color="danger">
            <i className="fa fa-ban"></i> Reset
          </Button>
        </CardFooter>
      </Form>
    </Card>
  );
};

export default withApollo(CreateCrashRecord);
