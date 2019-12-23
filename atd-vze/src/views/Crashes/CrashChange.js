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

  if(data) console.log(data);

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

      <Row>
        <Col xs="12" sm="12" md="9">
          <Card>
            <CardHeader>Change</CardHeader>
            <CardBody>
              <Row>
                <Col xs="12" sm="12" md="9">
                  Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed
                  diam nonummy nibh euismod tincidunt ut laoreet dolore magna
                  aliquam erat volutpat. Ut wisi enim ad minim veniam, quis
                  nostrud exerci tation ullamcorper suscipit lobortis nisl ut
                  aliquip ex ea commodo consequat.
                </Col>
                <Col xs="12" sm="12" md="3" className="text-center">
                  Ok
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
                    <i className="fa fa-lightbulb-o"></i>&nbsp;Accept
                  </Button>
                </Col>
                <Col sm xs="12" className="text-center">
                  <Button color="secondary" outline>
                    <i className="fa fa-lightbulb-o"></i>&nbsp;Reject CR3
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default withApollo(CrashChange);
