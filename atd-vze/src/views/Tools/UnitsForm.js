import React, { useState, useEffect } from "react";

import {
  Alert,
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

const UnitsForm = ({ units, handleUpdate }) => {
  console.log(units);
  console.log(units.length);

  useEffect(() => {
    console.log(units);
  });

  return (
    <>
      {units.map((unit, i) => {
        return (
          <Card>
            <CardHeader>Unit #{i + 1}</CardHeader>
            <CardBody>
              <FormGroup row>
                <Col md="3">
                  <Label htmlFor="unit-type">Unit Type</Label>
                </Col>
                <Col xs="12" md="9">
                  <Input
                    type="select"
                    id="unit-type"
                    name="unit-type"
                    placeholder="Enter Fatality Count..."
                    // value={fatalityCount}
                    // onChange={e => setFatalityCount(e.target.value)}
                  >
                    <option value={0}>Please select something</option>
                    <option value={1}>MOTOR VEHICLE</option>
                  </Input>
                  <FormText className="help-block">
                    Please enter the Fatality Count
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
                    // value={fatalityCount}
                    // onChange={e => setFatalityCount(e.target.value)}
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
                    // value={susSeriousInjuryCount}
                    // onChange={e => setSusSeriousInjuryCount(e.target.value)}
                  />
                  <FormText className="help-block">
                    Please enter the Suspected Serious Injury Count
                  </FormText>
                </Col>
              </FormGroup>
            </CardBody>
          </Card>
        );
      })}
    </>
  );
};
export default UnitsForm;
