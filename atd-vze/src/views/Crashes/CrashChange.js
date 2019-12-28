import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { withApollo } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";
import { MiniDiff } from "../../Components/MiniDiff";
import axios from "axios";

import "./crash.scss";

import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Button,
  Badge,
} from "reactstrap";

import { AppSwitch } from "@coreui/react";
import { GET_CRASH_CHANGE } from "../../queries/crashes_changes";
import { crashImportantDiffFields } from "./crashImportantDiffFields";

function CrashChange(props) {
  const crashId = props.match.params.id;
  const [selectedFields, setSelectedFields] = useState([]);

  const { loading, error, data, refetch } = useQuery(GET_CRASH_CHANGE, {
    variables: { crashId },
  });

  // Allocate for diff rows array
  let importantFields = null;
  let allFields = null;

  /**
   * Downloads a CR3
   */
  const downloadCR3 = () => {
    const requestUrl = `${process.env.REACT_APP_CR3_API_DOMAIN}/cr3/download/${crashId}`;
    const token = window.localStorage.getItem("id_token");
    console.log("Downloading request url: " + requestUrl);
    axios
      .request(requestUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => {
        const win = window.open(res.data.message, "_blank");
        win.focus();
      });
  };

  /**
   * Returns an array of strings with all the fields that have a different value.
   * @param data {object}
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

  /**
   * Generates a JSX Row object, it returns null if there is no difference between the original value
   * and the new value from the new record as provided by the ETL process.
   * @param field {string} - The name of the field in the database (the column)
   * @param label {string} - The name of the label to show (if not the name of the field)
   * @param originalFieldValue {string} - The value of the record as it currently is in the database.
   * @param newFieldValue {string} - The value of the new record as provided by the ETL process.
   * @returns {Row}
   */
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
          <Badge className="mr-1" color="light">
            Original
          </Badge>
          <span className="minidiff"> {originalValue}</span>
        </Col>
        <Col xs="12" sm="12" md="4">
          <Badge className="mr-1" color="danger">
            Change
          </Badge>
          <MiniDiff oldText={originalValue} newText={newValue} />
        </Col>
      </Row>
    ) : null;
  };

  // If the data object has no keys, then wait...
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
              <Row className="align-items-center mt-3">
                <Col sm xs="12" className="text-center mt-3">
                  <Link
                    className="btn btn-primary"
                    color="primary"
                    to={`/crashes/${crashId}`}
                    target="_blank"
                  >
                    <i className="fa fa-lightbulb-o"></i>&nbsp;Open Current
                    Record
                  </Link>
                </Col>
                <Col sm xs="12" className="text-center mt-3">
                  <Button color="secondary" onClick={downloadCR3}>
                    <i className="fa fa-lightbulb-o"></i>&nbsp;Download Current
                    CR3
                  </Button>
                </Col>
                <Col sm xs="12" className="text-center mt-3">
                  <Button color="success">
                    <i className="fa fa-lightbulb-o"></i>&nbsp;Approve All
                    Changes
                  </Button>
                </Col>
                <Col sm xs="12" className="text-center mt-3">
                  <Button color="warning">
                    <i className="fa fa-lightbulb-o"></i>&nbsp;Unselect all
                    changes
                  </Button>
                </Col>
                <Col sm xs="12" className="text-center mt-3">
                  <Button color="danger">
                    <i className="fa fa-lightbulb-o"></i>&nbsp;Discard Incoming
                    Record
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* IMPORTANT FIELDS */}
      <Row>
        <Col xs="12" sm="12" md="12">
          <Card>
            <CardHeader>
              <span>
                <strong>Main fields</strong>
              </span>
              <Button color="primary" className="float-right">
                <i className="fa fa-lightbulb-o"></i>&nbsp;Save Changes
              </Button>
              <Button color="light" className="float-right">
                <i className="fa fa-lightbulb-o"></i>&nbsp;Select All Changes
              </Button>
            </CardHeader>
            <CardBody>{importantFields}</CardBody>
          </Card>
        </Col>
      </Row>

      {/* OTHER FIELDS */}
      <Row>
        <Col xs="12" sm="12" md="12">
          <Card>
            <CardHeader>
              <span>
                <strong>All other fields</strong>
              </span>
              <Button color="primary" className="float-right">
                <i className="fa fa-lightbulb-o"></i>&nbsp;Save Changes
              </Button>
              <Button color="light" className="float-right">
                <i className="fa fa-lightbulb-o"></i>&nbsp;Select All Changes
              </Button>
            </CardHeader>
            <CardBody>{allFields}</CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default withApollo(CrashChange);
