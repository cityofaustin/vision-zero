import React, { useState } from "react";
import {
  NavLink,
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
  Table,
} from "reactstrap";

import { withApollo } from "react-apollo";
import { useQuery, useMutation } from "@apollo/react-hooks";

import "./ToolsUploadNonCR3.css";
import "handsontable/dist/handsontable.full.css";
import { HotTable } from "@handsontable/react";
import CSVReader from "react-csv-reader";
import { invalid } from "moment";
import { AppSwitch } from "@coreui/react";

function ToolsUploadNonCR3(props) {
  const [records, setRecords] = useState([]);
  const [invalidRecords, setInvalidRecords] = useState([]);
  const [validRecords, setValidRecords] = useState([]);
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);

  /**
   * Reference object for data export (Save to File)
   * @type {React.RefObject<unknown>}
   */
  const hotTableComponent = React.createRef();

  /**
   * Table Configuration
   * @type {{rowHeaders: boolean, colHeaders: string[], manualColumnResize: boolean, colWidths: number[]}}
   */
  const tableConfig = {
    colHeaders: [
      "Date",
      "Call No.",
      "Address",
      "Xcoord",
      "Ycoord",
      "Hour",
      "Valid",
    ],
    columns: [
      {
        data: "date",
        type: "date",
        dateFormat: "YYYY-MM-DD",
        correctFormat: true,
        defaultDate: "",
      },
      {
        data: "call_num", // 2nd column is simple text, no special options here
        type: "numeric",
      },
      {
        data: "address",
        type: "text",
      },
      {
        data: "longitude",
        type: "numeric",
      },
      {
        data: "latitude",
        type: "numeric",
      },
      {
        data: "hour",
        type: "numeric",
      },
      {
        data: "valid",
        type: "text",
      },
    ],
    dropdownMenu: true,
    filters: true,
    columnSorting: true,
    colWidths: [125, 100, 375, 100, 100, 75, 75],
    manualColumnResize: true,
    rowHeaders: true,
  };

  /**
   * Returns true if the record is valid, false otherwise.
   * @param {object} record
   * @return {array}
   */
  const isRecordValid = record => {
    let errors = [];

    if (!isValidDate(record["date"])) {
      errors.push("Invalid date");
    }

    if (!isValidCallNumber(record["call_num"])) {
      errors.push("Invalid call number");
    }

    if (!isValidAddress(record["address"])) {
      errors.push("Invalid address");
    }

    if (!isValidCoord(record["longitude"], record["latitude"])) {
      errors.push("Invalid coordinate pair");
    }

    if (!isValidHour(record["hour"])) {
      errors.push("Invalid hour number");
    }

    if (errors.length === 0) {
      return [true, "valid"];
    }

    return [false, "Errors: " + errors.join(", ")];
  };

  /**
   * Returns an ISO string if the date is valid.
   * @param {string} date - The date string to be evaluated
   * @return {string|null}
   */
  const parseDate = date => {
    try {
      return new Date(date).toISOString().slice(0, 10);
    } catch {
      return null;
    }
  };

  /**
   * Returns true if the date format is valid
   * @param {string} date - The date string to be evaluated
   * @return {boolean}
   */
  const isValidDate = date => {
    if (String(date).length === 0) return false;
    try {
      new Date(date);
      return true;
    } catch {
      return false;
    }
  };

  /**
   * Returns true if the call number is valid
   * @param {string} callno - The string to be parsed into a string.
   * @return {boolean}
   */
  const isValidCallNumber = callno => {
    if (String(callno).length === 0) return false;
    else return !isNaN(callno);
  };

  /**
   * Returns a clean address that is safe for insertion
   * @param {string} addr - The address string
   * @return {string} - The safe insertable text
   */
  const cleanUpAddress = addr => {
    return (addr ? addr : "").replace(/[^A-Za-z0-9\\\\/\-\s\.\,\&]/gi, "");
  };

  /**
   * Returns true if the address is valid
   * @param addr - The address string being evaluated
   * @return {boolean}
   */
  const isValidAddress = addr => {
    return cleanUpAddress(addr).length > 0;
  };

  /**
   * Returns true if both x and y are valid float values
   * @param {string} x - The Xcoord value (as string, later converted to float)
   * @param {string} y - The Ycoord value (as string, later converted to float)
   * @return {boolean}
   */
  const isValidCoord = (x, y) => {
    return isFloat(Number(x)) && isFloat(Number(y));
  };

  /**
   * Returns true if the string is a float
   * @param {Number} n - The string being evaluated
   * @return {boolean}
   */
  const isFloat = n => {
    return Number(n) === n && n % 1 !== 0;
  };

  /**
   * Returns true if the hour is valid
   * @param {string} hour - A string containing "0" through "23"
   * @return {boolean}
   */
  const isValidHour = hour => {
    if (String(hour).length === 0) return false;
    return Number(hour) >= 0 && Number(hour) <= 23;
  };

  const csvParserOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: header => header.toLowerCase().replace(/\W/g, "_"),
  };

  const handleOnFileLoaded = (data, fileInfo) => {
    console.log("File loaded");
    console.dir(data, fileInfo);

    handleValidate(data, null);
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
  };

  const handleValidate = (data, hotTable) => {
    if (data.length == 0) {
      if (hotTable) {
        data = hotTable.current.hotInstance.getData().map(record => {
          return {
            date: record[0],
            call_num: record[1],
            address: record[2],
            longitude: record[3],
            latitude: record[4],
            hour: record[5],
          };
        });
      } else {
        return;
      }
    }

    let finalData = [...data];
    let invalidRecords = [];

    finalData.forEach((record, index) => {
      const [valid, message] = isRecordValid(record);
      if (valid) {
        finalData[index]["address"] = cleanUpAddress(
          finalData[index]["address"]
        );
        finalData[index]["date"] = parseDate(finalData[index]["date"]);
        finalData[index]["valid"] = "✅";
      } else {
        finalData[index]["valid"] = "❌";
        invalidRecords.push({
          row: index + 1,
          message: message,
        });
      }
    });

    setInvalidRecords(invalidRecords);
    setRecords(finalData);
  };

  const handleSave = () => {
    return false;
  };

  const handleDownloadData = hotTable => {
    const exportPlugin = hotTable.current.hotInstance.getPlugin("exportFile");
    exportPlugin.downloadFile("csv", {
      columnHeaders: true,
      filename: "spreadsheet",
    });
  };

  const handleDownloadTemplate = () => {
    alert("YO!");
  };

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
          <Row>
            <Col lg={8} sm={8}>
              <CSVReader
                cssClass="csv-reader-input"
                label=""
                onFileLoaded={handleOnFileLoaded}
                onError={handleOnError}
                parserOptions={csvParserOptions}
                inputId="fileSelector"
                inputStyle={{ color: "red" }}
              />
            </Col>
            <Col lg={4} sm={4}>
              <NavLink
                className={"float-right"}
                href={"#"}
                onClick={handleDownloadTemplate}
              >
                <i className={"fa fa-file-excel-o"}></i> Download CSV Template
              </NavLink>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {!!records.length && (
        <Card>
          <CardHeader>Parsed Output</CardHeader>
          <CardBody>
            {records.length === 0 ? (
              <>Select a valid CSV file above.</>
            ) : (
              <Row>
                <Col lg={8} sm={12}>
                  <div className={"hottable"}>
                    <HotTable
                      ref={hotTableComponent}
                      data={records}
                      settings={tableConfig}
                      width="100%"
                      height="367"
                      licenseKey="non-commercial-and-evaluation"
                    />
                    <div className={"hottable__footer"}>
                      Double-click to edit. Scrolling is vertical and
                      horizontal. Click column label to sort, dropdown to
                      filter. Column resize allowed.
                    </div>
                  </div>
                </Col>
                <Col lg={4} sm={12}>
                  <ListGroup>
                    <ListGroupItem active action>
                      <span className={"text-value text-value--shadow"}>
                        {records.length}
                      </span>
                      <ListGroupItemHeading>Total Records</ListGroupItemHeading>
                      <ListGroupItemText>
                        This is the total of all rows processed.
                      </ListGroupItemText>
                    </ListGroupItem>
                    <ListGroupItem action>
                      <span className={"text-value"}>
                        {invalidRecords.length}
                      </span>
                      <ListGroupItemHeading>Total Errors</ListGroupItemHeading>
                      <ListGroupItemText>
                        Records that exhibit a problem. See logs below.
                      </ListGroupItemText>
                    </ListGroupItem>
                  </ListGroup>
                  <>
                    <Button
                      size="sm"
                      className="btn-secondary mr-1 mb-1 btn-secondary--spaced"
                      onClick={() => handleDownloadData(hotTableComponent)}
                    >
                      <i className="fa fa-download"></i>&nbsp;
                      <span>Download this spreadsheet</span>
                    </Button>
                  </>
                </Col>
              </Row>
            )}
          </CardBody>
          {!!records.length && (
            <CardBody
              style={{
                background: "#f9f9f9",
                "border-top": "1px solid #c8ced3",
              }}
            >
              <Button
                size="lg"
                className="btn-twitter btn-brand mr-1 mb-1 float-right"
                onClick={handleSave}
              >
                <i className="fa fa-save"></i>
                <span>Save to Database</span>
              </Button>
              <Button
                size="lg"
                className="btn-success btn-brand mr-1 mb-1 float-right"
                onClick={() => handleValidate([], hotTableComponent)}
              >
                <i className="fa fa-check-circle"></i>
                <span>Validate</span>
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
      )}

      {!!records.length && (
        <Card>
          <CardHeader>Error Log</CardHeader>
          <CardBody>
            {!!invalidRecords.length ? (
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Row Number</th>
                    <th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {invalidRecords.map(item => {
                    return (
                      <tr>
                        <td>{item["row"]}</td>
                        <td>{item["message"]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            ) : (
              "No errors detected"
            )}
          </CardBody>
        </Card>
      )}
    </>
  );
}

export default withApollo(ToolsUploadNonCR3);
