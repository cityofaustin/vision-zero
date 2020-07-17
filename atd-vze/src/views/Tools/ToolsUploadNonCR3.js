import React, { useState, useEffect } from "react";
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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
} from "reactstrap";

import { withApollo } from "react-apollo";
import { useMutation } from "@apollo/react-hooks";

import "./ToolsUploadNonCR3.css";
import "handsontable/dist/handsontable.full.css";
import { HotTable } from "@handsontable/react";
import CSVReader from "react-csv-reader";

import {
  mutationDummy,
  mutationInsertNonCR3,
} from "../../queries/toolsUploadNonCR3";
import { gql } from "apollo-boost";

const ToolsUploadNonCR3 = () => {
  const [records, setRecords] = useState([]);
  const [invalidRecords, setInvalidRecords] = useState(0);
  const bundleSize = 500;

  // Modals
  const [modalFeedback, setModalFeedback] = useState(false);
  const [modalSaveProcess, setModalSaveProcess] = useState(false);
  const [modalSaveConfirm, setModalSaveConfirm] = useState(false);
  const [processedRecords, setProcessedRecords] = useState(0);
  const [recordsToProcess, setRecordsToProcess] = useState([]);
  const [feedback, setFeedback] = useState({});

  const isLocalEnvironment = () => {
    return window.location.href.indexOf("localhost") > -1;
  };

  // Mutation
  const [upsertRecordsQuery, setUpsertRecordsQuery] = useState(mutationDummy);

  /**
   * Apollo mutation handler
   */
  const [upsertRecordUpdates] = useMutation(
    gql`
      ${upsertRecordsQuery}
    `
  );

  /**
   * Toggles save confirm modal
   */
  const toggleModalSaveConfirm = () => setModalSaveConfirm(!modalSaveConfirm);

  /**
   * Reference object for data export (Save to File)
   * @type {React.RefObject<unknown>}
   */
  const hotTableComponent = React.createRef();

  /**
   * The CSVReader component configuration settings.
   * @type {{skipEmptyLines: boolean, transformHeader: (function(*): string), header: boolean, dynamicTyping: boolean}}
   */
  const csvParserOptions = {
    header: true,
    quotes: false,
    quoteChar: '"',
    delimiter: ",",
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: header => header.toLowerCase().replace(/\W/g, "_"),
  };

  /**
   * HandsonTable component configuration settings
   * @type {{rowHeaders: boolean, colHeaders: string[], manualColumnResize: boolean, colWidths: number[]}}
   */
  const tableConfig = {
    colHeaders: [
      "Date",
      "Case ID",
      "Address",
      "Xcoord",
      "Ycoord",
      "Hour",
      "Valid",
      "Message",
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
        data: "case_id",
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
      {
        data: "message",
        type: "text",
      },
    ],
    dropdownMenu: true,
    filters: false,
    columnSorting: true,
    colWidths: [125, 100, 375, 100, 100, 75, 75, 100],
    manualColumnResize: true,
    rowHeaders: true,
  };

  /**
   * Returns a tuple with true or false if the record is valid and a message.
   * @param {JSON} record - A single JSON object containing the record
   * @return {[bool, string]}
   */
  const isRecordValid = record => {
    let errors = [];

    if (!isValidDate(record["date"])) {
      errors.push("Invalid date");
    }

    if (!isValidNumber(record["case_id"])) {
      errors.push("Invalid case id");
    }

    if (!isValidCoord(record["longitude"], record["latitude"])) {
      errors.push("Invalid coordinate pair");
    }

    if (!isValidHour(record["hour"])) {
      errors.push("Invalid hour number");
    }

    if (errors.length === 0) {
      return [true, "Valid"];
    }

    return [false, "Errors: " + errors.join(", ")];
  };

  /**
   * Returns an ISO string if the date is valid.
   * @param {string} date - The date string to be evaluated
   * @return {string}
   */
  const parseDate = date => {
    try {
      const parsedDate = new Date(date).toISOString().slice(0, 10);
      return parsedDate !== "1970-01-01" ? parsedDate : "";
    } catch {
      return "";
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
   * Returns a clean address that is safe for insertion
   * @param {string} addr - The address string
   * @return {string} - The safe insertable text
   */
  const cleanUpAddress = addr =>
    (addr ? addr : "").replace(/[^A-Za-z0-9\\/\-\s.,&]/gi, "");

  /**
   * Returns true if both x and y are valid float values
   * @param {string} x - The Xcoord value (as string, later converted to float)
   * @param {string} y - The Ycoord value (as string, later converted to float)
   * @return {boolean}
   */
  const isValidCoord = (x, y) => isFloat(Number(x)) && isFloat(Number(y));

  /**
   * Returns true if the string is a float
   * @param {Number} n - The string being evaluated
   * @return {boolean}
   */
  const isFloat = n => Number(n) === n && n % 1 !== 0;

  /**
   * Returns true if the hour is valid
   * @param {string} hour - A string containing "0" through "23"
   * @return {boolean}
   */
  const isValidNumber = num => new RegExp("^[0-9]+$").test(num);

  /**
   * Returns true if the hour is an integer between 0 and 23
   * @param {string} hour - The hour being evaluated
   * @return {boolean}
   */
  const isValidHour = hour =>
    isValidNumber(hour) && Number(hour) >= 0 && Number(hour) <= 23;

  /**
   * Handler for CSVReader to pipe incoming data into the validator function.
   * @param {JSON} data - The data loaded from the CSVReder component
   * @param {Object} fileInfo - CSVReader additional information of file.
   */
  const handleOnFileLoaded = (data, fileInfo) => handleValidate(data, null);

  /**
   * Handler for CSVReader error feedback
   * @param err
   */
  const handleOnError = err => {
    console.log("File loading error: ", err);
  };

  /**
   * Handle Reset
   */
  const handleReset = () => {
    document.querySelector("input[id='fileSelector']").value = "";
    setRecords([]);
    setRecordsToProcess([]);
    setProcessedRecords(0);
  };

  /**
   * Handles the data validation process on data load, or on validate button click.
   * @param {JSON} data - The data to be validated as a JSON object.
   * @param {Object} hotTable - The react reference object.
   */
  const handleValidate = (data, hotTable) => {
    if ([...data].length === 0) {
      // If we are validating a hot table, then hotTable is not null..
      if (hotTable) {
        /**
         * If we are validating a hot table, then we must assume data is null
         * and we have to populate with the hot table's data which is a simple
         * array that needs to be transformed into a json array.
         * @type {{date: *, address: *, hour: *, latitude: *, case_id: *, longitude: *}[]}
         */
        data = hotTable.current.hotInstance.getData().map(record => {
          return {
            date: record[0],
            case_id: record[1],
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

    // We have data, let's check if there are any duplicates
    const counts = getDuplicateCount(data);

    const duplicates = Object.keys(counts).filter((node) => {
      return counts[node] > 1;
    }).map(node => {
      return `${node}: ${counts[node]} occurrences`;
    })

    if(duplicates.length > 0) {
      setFeedback(
        {
          title: "Error",
          message: <div>
            <p>Validation Error: Within the <strong>{data.length}</strong> existing records, there are <strong>{duplicates.length}</strong> with the same Case IDs:</p>
            <textarea style={{"width": "100%", "height": "15rem"}}>
                {String(duplicates.join(",\n"))}
              </textarea>
          </div>
        }
      )
      return;
    }

    /**
     * Once we have our data, from main load sequence or from the hot table
     * we must create a copy we can modify...
     * @type {*[]}
     */
    let finalData = [...data];
    let invalidRecords = 0;

    /**
     * Validate each record in our data copy
     */
    finalData.forEach((record, index) => {
      // Clean up the address for insertion
      finalData[index]["address"] = cleanUpAddress(finalData[index]["address"]);

      // Try parsing the date, regardless...
      finalData[index]["date"] = parseDate(finalData[index]["date"]);

      // Perform Validation
      const [valid, message] = isRecordValid(record);

      // Mark the record with an icon
      finalData[index]["valid"] = valid ? "✅" : "❌";
      finalData[index]["message"] = message;
      invalidRecords += valid ? 0 : 1;
    });

    // Change the state
    setInvalidRecords(invalidRecords);
    setRecords(finalData);
  };

  /**
   * Returns the number of duplicate call numbers.
   * @param {Object} data
   * @return {Array}
   */
  const getDuplicateCount = (data) => {
    return data.reduce((acc, currNode) => {
      // Convert the call num to string so we can use as a key
      const case_id = String(currNode["case_id"]);
      // Check if there is already value and add +1, or assign 1 to it.
      acc[case_id] = (acc[case_id] || 0) + 1;
      // Return new state of out count dictionary
      return acc;
    }, {});
  }

  /**
   * Saves the files into the database. Not yet implemented.
   * @param {Object} hotTable - The React reference to the hot table component
   */
  const handleSave = hotTable => {
    // Generate the records to process...
    const data = hotTable.current.hotInstance
      .getData()
      .map(record => {
        return {
          date: record[0],
          case_id: record[1],
          address: record[2],
          longitude: record[3],
          latitude: record[4],
          hour: record[5],
        };
      })
      .filter(record => {
        return isRecordValid(record)[0];
      });

    // If we have no duplicates, and valid data
    if (data.length === 0) {
      setFeedback({
        title: "No Valid Records Found",
        message:
          "None of the records currently in the spreadsheet editor is valid. Please make sure you have records loaded and validated.",
      });
      setModalFeedback(true);
      setModalSaveConfirm(false);
    } else {
      // We have data, let's check if there are any duplicates
      const counts = getDuplicateCount(data);

      const duplicates = Object.keys(counts).filter((node) => {
        return counts[node] > 1;
      }).map(node => {
        return `${node}: ${counts[node]} occurrences`;
      })

      if(duplicates.length > 0) {
        setModalSaveConfirm(false);
        setFeedback(
          {
            title: "Error",
            message: <div>
              <p>Action canceled. Please resolve the duplicates before inserting. Within the <strong>{data.length}</strong> valid records, there are <strong>{duplicates.length}</strong> with the same Case IDs:</p>
              <textarea style={{"width": "100%", "height": "15rem"}}>
                {String(duplicates.join(",\n"))}
              </textarea>
            </div>
          }
        )
      } else {
        // We have no duplicates, proceed...
        setModalSaveProcess(true);
        setRecordsToProcess(data);
      }
    }
  };

  /**
   * Execution main loop
   * @return {Promise<void>}
   */
  const executeSave = async () => {
    let data = [...recordsToProcess];
    let processCount = 0;

    while (data.length !== 0) {
      const currentBundle = data.splice(0, bundleSize);
      const query = generateGraphQL(currentBundle);
      console.log("Executing query: ", query);
      await setUpsertRecordsQuery(
        gql`
          ${query}
        `
      );
      await upsertRecordUpdates();
      processCount += currentBundle.length;
      await setProcessedRecords(processCount);
    }
  };

  /**
   * Waits until recordsToProcess to begin insertions
   */
  useEffect(() => {
    if (recordsToProcess.length > 0)
      executeSave()
        .then(() => {
          setFeedback({
            title: "Success",
            message: "The save process was successful.",
          });
          setRecordsToProcess([]);
          setProcessedRecords(0);
        })
        .catch(error => {
          setFeedback({
            title: "Error",
            message: String(error),
          });
        });
  }, [recordsToProcess]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * On transaction feedback hide save process dialogs
   */
  useEffect(() => {
    const type = feedback.title || "undefined";
    if(type === "Error" || type === "Success") {
      setModalSaveProcess(false);
      setModalSaveConfirm(false);
      setModalFeedback(true);
    }
  }, [feedback]);

  /**
   * Handles the clicking on the download spreadsheet button.
   * @param {Object} hotTable - The react reference object
   */
  const handleDownloadData = hotTable => {
    const exportPlugin = hotTable.current.hotInstance.getPlugin("exportFile");
    exportPlugin.downloadFile("csv", {
      columnHeaders: true,
      filename: "spreadsheet",
    });
  };

  /**
   * Generates a GraphQL query based on a bundle of JSON records.
   * @param {JSON[]} recordBundle - An array of JSON objects
   * @return {string} - The GraphQL query to be executed
   */
  const generateGraphQL = recordBundle => {
    return mutationInsertNonCR3.replace(
      "%NON_CR3_DATA%",
      recordBundle
        .map(record => {
          const re = /"([a-z_]+)":/gi;
          return JSON.stringify(record).replace(re, "$1: ");
        })
        .join(", ")
    );
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
                href={
                  (!isLocalEnvironment() ? "/editor" : "") +
                  "/downloads/non_cr3_template.csv"
                }
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
                      <span className={"text-value"}>{invalidRecords}</span>
                      <ListGroupItemHeading>Total Errors</ListGroupItemHeading>
                      <ListGroupItemText>
                        Records that exhibit a problem. See error log below.
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
                onClick={() => toggleModalSaveConfirm(hotTableComponent)}
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

      <Modal isOpen={modalSaveProcess} className={"modal-lg"} keyboard={false}>
        <ModalHeader>Committing Records to Database</ModalHeader>
        <ModalBody>
          <span>Please wait while saving changes to the database.</span>
          <br />
          <span>
            Processed: {processedRecords}/{recordsToProcess.length}
          </span>
          <br />

          <Progress
            animated
            color="info"
            value={(processedRecords / recordsToProcess.length) * 100}
            className="mb-3"
          />
        </ModalBody>
        <ModalFooter>This dialog will close when done.</ModalFooter>
      </Modal>

      <Modal
        isOpen={modalSaveConfirm}
        toggle={toggleModalSaveConfirm}
        className={"modal-primary"}
      >
        <ModalHeader toggle={toggleModalSaveConfirm}>Confirm Save</ModalHeader>
        <ModalBody>
          <p>
            Only valid records will be processed, if you have any invalid
            records and you would like to fix them, click 'Cancel'; otherwise,
            click 'Continue'.
          </p>
          <p>
            Any records already in the database will be overwritten (updated).
          </p>
          <p>
            <strong>Invalid records will be ignored.</strong>
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => handleSave(hotTableComponent)}>
            Continue
          </Button>{" "}
          <Button color="secondary" onClick={toggleModalSaveConfirm}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={modalFeedback}
        toggle={toggleModalSaveConfirm}
        className={"modal-primary"}
      >
        <ModalHeader toggle={toggleModalSaveConfirm}>
          {feedback["title"]}
        </ModalHeader>
        <ModalBody>{feedback["message"]}</ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setModalFeedback(false)}>
            Ok
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default withApollo(ToolsUploadNonCR3);
