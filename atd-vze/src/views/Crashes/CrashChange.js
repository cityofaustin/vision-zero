import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  Alert,
  Button,
} from "reactstrap";
import { withApollo } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";

import "./crash.scss";

import { GET_CRASH_CHANGE } from "../../queries/crashes_changes";

function CrashChange(props) {
  const crashId = props.match.params.id;

  const { loading, error, data, refetch } = useQuery(GET_CRASH_CHANGE, {
    variables: { crashId },
  });

  // Allocate for diff rows array
  let diffRows = null;

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
        return `${newRecord[currentKey]}` !== `${originalRecord[currentKey]}`
          ? currentKey
          : "/-n/a-/";
      })
      .filter(e => e !== "/-n/a-/")
      .sort();
  };

  if (Object.keys(data).length > 0) {
    console.log("These are all the different fields:");
    let differentFields = generate_diff(data);
    let originalRecord = data["atd_txdot_crashes"][0] || null;
    let newRecord =
      JSON.parse(data["atd_txdot_changes"][0]["record_json"]) || null;

    diffRows = differentFields.map((key, i) => {
      return (
        <Row>
          <Col xs="12" sm="12" md="9">
            <Card>
              <CardHeader>Change: {key}</CardHeader>
              <CardBody>
                <Row>
                  <Col xs="12" sm="12" md="9">
                    Original Record: {originalRecord[key]}
                    <br />
                    New Record: {newRecord[key]}
                  </Col>
                  <Col xs="12" sm="12" md="3" className="text-center">
                    difference
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col xs="12" sm="12" md="3">
            <Card>
              <CardHeader>Action</CardHeader>
              <CardBody>
                <Row className="align-items-center">
                  <Col sm xs="12" className="text-center">
                    <Button color="primary">
                      <i className="fa fa-lightbulb-o"></i>&nbsp;Accept Change
                    </Button>
                  </Col>
                  <Col sm xs="12" className="text-center">
                    <Button color="secondary" outline>
                      <i className="fa fa-lightbulb-o"></i>&nbsp;Reject Change
                    </Button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      );
    });
  }

  return (
    <div className="animated fadeIn">
      <Row>
        <Col xs="12" sm="12" md="12">
          <Card>
            <CardHeader>
              <strong>With Icons</strong>
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
      {diffRows}
    </div>
  );
}

export default withApollo(CrashChange);
