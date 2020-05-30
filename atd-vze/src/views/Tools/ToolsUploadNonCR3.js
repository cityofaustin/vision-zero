import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Button,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText,
  ListGroup,
} from "reactstrap";

import { withApollo } from "react-apollo";
import { useQuery, useMutation } from "@apollo/react-hooks";

import "./ToolsUploadNonCR3.css";
import "handsontable/dist/handsontable.full.css";
import { HotTable } from "@handsontable/react";
import CSVReader from "react-csv-reader";

function ToolsUploadNonCR3(props) {
  const [records, setRecords] = useState([]);

  const tableConfig = {
    colHeaders: ["Date", "Call#", "Address", "Xcoord", "Ycoord", "Hour"],
  };

  /**
   * Returns true if the record is valid, false otherwise.
   * @param {object} record
   * @return {boolean}
   */
  const isRecordValid = record => {
    return false;
  }

  /**
   * Returns true if the date format is valid
   * @param {string} date - The date string to be evaluated
   * @return {boolean}
   */
  const isValidDate = date => {
    return false;
  }

  /**
   * Converts a string from locale date to iso date (yyyy-mm-dd)
   * @param {string} date - The locale date (mm/dd/yyyy)
   * @return {string} - The ISO date (yyyy-mm-dd)
   */
  const toIsoDate = date => {
    return "";
  }

  const isValidCallNumber = callno => {
    return false;
  }

  /**
   * Returns a clean address that is safe for insertion
   * @param {string} addr - The address string
   * @return {string} - The safe insertable text
   */
  const cleanUpAddress = addr => {
    return "";
  }

  /**
   * Returns true if both x and y are valid float values
   * @param {string} x - The Xcoord value (as string, later converted to float)
   * @param {string} y - The Ycoord value (as string, later converted to float)
   * @return {boolean}
   */
  const isValidCoord = (x, y) => {
    return false;
  }

  /**
   * Returns true if the hour is valid
   * @param {string} hour - A string containing "0" through "23"
   * @return {boolean}
   */
  const isValidHour = hour => {
    return false;
  }

  const csvParserOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: header => header.toLowerCase().replace(/\W/g, "_"),
  };

  const handleOnFileLoaded = (data, fileInfo) => {
    console.log("File loaded");
    console.dir(data, fileInfo);
    setRecords(data);
  };

  const handleOnError = err => {
    console.log("File loading error: ", err);
  };

  /**
   * Handle Reset
   */
  const handleReset = () => {
    document.querySelector("input[id='fileSelector']").value = "";
    setRecords([]);
  }

  return (
    <>
      <Card>
        <CardHeader>
          {records.length === 0 ? (
            <>Select a CSV file with Non-CR3 records</>
          ) : (
            <>
              There are <b>{records.length}</b> records to be inserted
            </>
          )}
        </CardHeader>
        <CardBody>
          <CSVReader
            cssClass="csv-reader-input"
            label=""
            onFileLoaded={handleOnFileLoaded}
            onError={handleOnError}
            parserOptions={csvParserOptions}
            inputId="fileSelector"
            inputStyle={{ color: "red" }}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>Parsed Output</CardHeader>
        <CardBody>
          {records.length === 0 ? (
            <>Select a valid CSV file above.</>
          ) : (
            <Row>
              <Col lg={6} sm={12}>
                <HotTable
                  data={records}
                  settings={tableConfig}
                  width="100%"
                  height="367"
                  licenseKey="non-commercial-and-evaluation"
                />
              </Col>
              <Col lg={6} sm={12}>
                <ListGroup>
                  <ListGroupItem active action>
                    <span className={"text-value text-value--shadow"}>
                      {records.length}
                    </span>
                    <ListGroupItemHeading>
                      Total complete records
                    </ListGroupItemHeading>
                    <ListGroupItemText>
                      These are records that do not have any missing fields.
                    </ListGroupItemText>
                  </ListGroupItem>
                  <ListGroupItem action>
                    <span className={"text-value"}>
                      {records.length}
                    </span>
                    <ListGroupItemHeading>Total Errors</ListGroupItemHeading>
                    <ListGroupItemText>
                      Records that show problems in format.
                    </ListGroupItemText>
                  </ListGroupItem>
                </ListGroup>
              </Col>
            </Row>
          )}
        </CardBody>
        {!!records.length && (
          <CardBody style={{"background": "#f9f9f9", "border-top": "1px solid #c8ced3"}}>
            <Button
              size="lg"
              className="btn-twitter btn-brand mr-1 mb-1 float-right"
            >
              <i className="fa fa-save"></i>
              <span>Save</span>
            </Button>
            <Button
              size="lg"
              className="btn-danger btn-brand mr-1 mb-1"
              onClick={handleReset}
            >
              <i className="fa fa-trash-o"></i>
              <span>Reset &amp; Start Over</span>
            </Button>
          </CardBody>
        )}
      </Card>

      <Card>
        <CardHeader>
          Error Log
        </CardHeader>
        <CardBody>
          Nothing to be shown
        </CardBody>
      </Card>
    </>
  );
}

export default withApollo(ToolsUploadNonCR3);
