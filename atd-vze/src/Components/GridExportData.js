import React, { useState } from "react";
import { withApollo } from "react-apollo";
import { useLazyQuery } from "@apollo/react-hooks";
import { formatISO } from "date-fns";
import { CSVLink } from "react-csv";
import styled from "styled-components";
import { colors } from "../styles/colors";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Col,
  FormGroup,
  Input,
  Label,
  Row,
  Alert,
} from "reactstrap";
import { AppSwitch } from "@coreui/react";

const exportWarningLimit = 4000;

const StyledSaveLink = styled.i`
  color: ${colors.info};
  cursor: pointer;
  :hover {
    color: ${colors.primary};
  }
`;

const GridExportData = ({ query, columnsToExport, totalRecords }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use .queryCSV to insert columnsToExport prop into query
  let [getExport, { loading, data }] = useLazyQuery(
    query.queryCSV(columnsToExport),
    { fetchPolicy: "no-cache" } // Temporary fix for https://github.com/apollographql/react-apollo/issues/3361
  );

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  // Open modal and execute initial query
  const toggleModalAndExport = () => {
    setIsModalOpen(!isModalOpen);
    getExport();
  };

  // Set query limit from inputs and then execute query
  const setExportLimit = event => {
    // Limit set to 1 so that query doesn't include all records unintentionally
    if (event.target.id === "csv-number-input") {
      query.limit = event.target.value !== "" ? event.target.value : 1;
    } else if ((event.target.id = "csv-checkbox-input")) {
      query.limit = event.target.checked ? totalRecords : 1;
    }
    getExport();
  };

  /**
   * Returns an array of objects (each object is a row and each key of that object is a column in the export file)
   * @param {array} data - Data returned from DB with nested data structures
   * @returns {array}
   */
  const formatExportData = data => {
    // Move nested keys to top level object (CSVLink uses each top level key as a column header)
    const flattenRow = (row, flattenedRow) => {
      Object.entries(row).forEach(([columnName, columnValue]) => {
        if (columnName === "__typename") {
          // Ignore __typename (contains table name which is already in filename)
          return;
        } else if (Array.isArray(columnValue)) {
          // If value is array, recursive call and handle objects in array
          flattenRow(columnValue, flattenedRow);
        } else if (typeof columnValue === "object" && columnValue !== null) {
          // If value is object, recursive call and handle k/v pairs in object
          flattenRow(columnValue, flattenedRow);
        } else {
          // Handle key/value pairs, concat if column already exists
          if (flattenedRow[columnName]) {
            flattenedRow[
              columnName
            ] = `${flattenedRow[columnName]}, ${columnValue}`;
          } else {
            flattenedRow[columnName] = columnValue;
          }
        }
      });
      return flattenedRow;
    };

    // Flatten each row and return array of objects for CSVLink data
    const flattenedData = data.map(row => {
      let flattenedRow = {};
      flattenedRow = flattenRow(row, flattenedRow);
      return flattenedRow;
    });

    const cleanedAndFlattenedData = flattenedData.map(item => {
      // Some fields are presenting issues when they are exported as .csv and
      // imported into MSFT Excel, Acces & Power BI. For now, we're just going to
      // modify the data for export to solve issues related to returns and double-quotes
      // In the future, we may choose to clean these values at the database level.

      const columnsToClean = [
        "rpt_street_name",
        "rpt_street_desc",
        "rpt_sec_street_desc",
        "rpt_sec_street_name",
      ];

      columnsToClean.forEach(col => {
        if (item[col]) {
          // remove return carriage and replace with space
          item[col] = item[col].replace(/(\r\n|\n|\r|")/gm, " ");
          // remove double-quotes
          item[col] = item[col].replace(/"/g, "");
        }
      });

      return item;
    });

    // Create array of columns that should be displayed in the table
    let columnsToExportParsed = [];

    columnsToExport.split("\n").forEach(line => {
      // Parse out unnecessary text and nesting keys from columnsToExport string,
      // push resulting column names to columnsToExportParsed array
      if (line === "") {
        return;
      } else if (line.includes(" { ")) {
        const nestedKeyArray = line.split(" { ");
        const nestedKeyString = nestedKeyArray[nestedKeyArray.length - 1];
        const nestedKey = nestedKeyString.split(" ")[0];
        columnsToExportParsed.push(nestedKey);
      } else {
        columnsToExportParsed.push(line);
      }
    });

    const cleanedFlattenedAndParsedData = cleanedAndFlattenedData.map(item => {
      // Parse out unnecessary columns before exporting table, rename one column
      Object.keys(item).forEach(col => {
        if (!columnsToExportParsed.includes(col)) {
          // Delete the key/value pair if the column is not present in columnsToExportParsed array
          delete item[col];
        } else if (col === "death_cnt") {
          // Rename death_cnt column to cris_death_cnt at the request of VZ Team
          item["cris_death_cnt"] = item["death_cnt"];
          delete item["death_cnt"];
        }
      });
      return item;
    });

    return cleanedFlattenedAndParsedData;
  };

  return (
    <>
      <StyledSaveLink>
        <i
          className="fa fa-save fa-2x ml-2 mt-1"
          onClick={toggleModalAndExport}
        />
      </StyledSaveLink>
      <Modal isOpen={isModalOpen} toggle={toggleModal} className={"modal-sm "}>
        <ModalHeader toggle={toggleModal}>
          Export to .csv ({query.limit} rows)
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Row>
              <Col sm="8">
                <Input
                  id="csv-number-input"
                  type="number"
                  placeholder="Number of rows"
                  min={0}
                  max={totalRecords}
                  onChange={setExportLimit}
                />
              </Col>
            </Row>
            <Row className="mt-3">
              <Col sm="8">
                <Label
                  className="form-check-label"
                  check
                  htmlFor="csv-checkbox-input"
                >
                  <AppSwitch
                    id="csv-checkbox-input"
                    onChange={setExportLimit}
                    className={"mx-1"}
                    variant={"3d"}
                    color={"success"}
                  />
                  All ({totalRecords} rows)
                </Label>
              </Col>
            </Row>
          </FormGroup>
          {query.limit > exportWarningLimit && (
            <Alert color="danger">
              For larger downloads, please expect a delay while the CSV file is
              generated. This may take multiple minutes.
            </Alert>
          )}
        </ModalBody>
        <ModalFooter>
          {!loading && data ? (
            <CSVLink
              className=""
              data={formatExportData(data[query.table])}
              filename={query.table + formatISO(Date.now())}
            >
              <Button color="primary" onClick={toggleModal}>
                Save
              </Button>
            </CSVLink>
          ) : (
            <Spinner className="mt-2" color="primary" />
          )}{" "}
          <Button color="secondary" onClick={toggleModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default withApollo(GridExportData);
