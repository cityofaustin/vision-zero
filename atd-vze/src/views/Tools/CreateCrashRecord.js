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

import "./CreateCrashRecord.css";

const CreateCrashRecord = () => {
  return (
    <Card>
      <CardHeader>Create New Crash Record Set</CardHeader>
      <CardBody>
        <Form action="" method="post" className="form-horizontal">
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
        </Form>
      </CardBody>
      <CardFooter>
        <Button type="submit" size="sm" color="primary">
          <i className="fa fa-dot-circle-o"></i> Submit
        </Button>
        <Button type="reset" size="sm" color="danger">
          <i className="fa fa-ban"></i> Reset
        </Button>
      </CardFooter>
    </Card>
  );
};

export default withApollo(CreateCrashRecord);
