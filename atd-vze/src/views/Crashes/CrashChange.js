import React, { useState } from "react";
import { Link } from "react-router-dom";
import { withApollo } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";

import "./crash.scss";

import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Alert,
  Button,
} from "reactstrap";

import { AppSwitch } from "@coreui/react";

import { GET_CRASH_CHANGE } from "../../queries/crashes_changes";
import { crashImportantDiffFields } from "./crashImportantDiffFields";

function CrashChange(props) {
  const crashId = props.match.params.id;

  const { loading, error, data, refetch } = useQuery(GET_CRASH_CHANGE, {
    variables: { crashId },
  });

  // Allocate for diff rows array
  let importantFields = null;
  let allFields = null;

  /**
   * Returns an array of strings with all the fields that have a different value.
   * @param data
   * @returns {array[string]}
   */
  const generate_diff = data => {
    let originalRecord = data["atd_txdot_crashes"][0] || null;
    let newRecord =
      JSON.parse(data["atd_txdot_changes"][0]["record_json"]) || null;

    return Object.keys(newRecord)
      .map((currentKey, i) => {
        return `${newRecord[currentKey]}`.trim() !==
          `${originalRecord[currentKey]}`.trim()
          ? currentKey
          : "/-n/a-/";
      })
      .filter(e => e !== "/-n/a-/")
      .sort();
  };

  const generateRow = (field, label, originalFieldValue, newFieldValue) => {
    const originalValue = originalFieldValue
      ? `${originalFieldValue}`.trim()
      : "";

    const newValue = newFieldValue ? `${newFieldValue}`.trim() : "";
    const change = originalValue !== newValue;

    return change ? (
      <Row key={field} className={"crash-row"}>
        <Col xs="6" sm="6" md="1">
          <AppSwitch
            className={"mx-1"}
            variant={"pill"}
            color={"primary"}
            outline={"alt"}
            label
            dataOn={"\u2713"}
            dataOff={"\u2715"}
          />
        </Col>
        <Col xs="6" sm="6" md="3">
          <strong>{field}</strong>
        </Col>
        <Col xs="12" sm="12" md="4">
          Original Record: {originalValue}
        </Col>
        <Col xs="12" sm="12" md="4">
          New Record: {newValue}
        </Col>
      </Row>
    ) : null;
  };

  if (Object.keys(data).length > 0) {
    let originalRecord = data["atd_txdot_crashes"][0] || null;
    let newRecord =
      JSON.parse(data["atd_txdot_changes"][0]["record_json"]) || null;

    // We need a list of all important fields as defined in crashImportantDiffFields
    let importantFieldList = Object.keys(crashImportantDiffFields).map(
      (field, i) => {
        return field;
      }
    );

    // Now we need the rest of all other fields
    let differentFieldsList = generate_diff(data).filter((field, i) => {
      return !importantFieldList.includes(field);
    });

    // Now we get to build our component based on our list of importnt fields
    importantFields = Object.keys(crashImportantDiffFields).map((field, i) => {
      return generateRow(
        field,
        field.label,
        originalRecord[field],
        newRecord[field]
      );
    });

    allFields = differentFieldsList.map((field, i) => {
      return generateRow(field, field, originalRecord[field], newRecord[field]);
    });
  }

  return (
    <div className="animated fadeIn">
      <Row>
        <Col xs="12" sm="12" md="12">
          <Card>
            <CardHeader>
              <strong>Main Options</strong>
            </CardHeader>
            <CardBody>
              <span>Select from the following menu:</span>
              <Row className="align-items-center mt-3">
                <Col sm xs="12" className="text-center mt-3">
                  <Button color="primary">
                    <i className="fa fa-lightbulb-o"></i>&nbsp;Current Record
                  </Button>
                </Col>
                <Col sm xs="12" className="text-center mt-3">
                  <Button color="secondary" outline>
                    <i className="fa fa-lightbulb-o"></i>&nbsp;Download Current
                    CR3
                  </Button>
                </Col>
                <Col sm xs="12" className="text-center mt-3">
                  <Button color="ghost-success">
                    <i className="fa fa-lightbulb-o"></i>&nbsp;Approve All
                    Changes
                  </Button>
                </Col>
                <Col sm xs="12" className="text-center mt-3">
                  <Button color="warning" className="btn-square">
                    <i className="fa fa-lightbulb-o"></i>&nbsp;Undo all changes
                  </Button>
                </Col>
                <Col sm xs="12" className="text-center mt-3">
                  <Button color="danger" className="btn-pill">
                    <i className="fa fa-lightbulb-o"></i>&nbsp;Discard Incoming
                    Record
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
  );
}

export default withApollo(CrashChange);
