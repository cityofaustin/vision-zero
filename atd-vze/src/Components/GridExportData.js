import React, { useState } from "react";
import { withApollo } from "react-apollo";
import { useLazyQuery } from "@apollo/react-hooks";
import moment from "moment";
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
    query.queryCSV(columnsToExport)
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
   * @param {Array} Data returned from DB with nested data structures
   * @returns {array}
   */
  const formatExportData = data => {
    // Moves nested data to top level object (CSVLink uses each top level key as a column header)
    // Handles:
    // 1. Nested objects
    // 2. Nested arrays of objects
    const newData = data.map(row => {
      // Look through each row for nested objects or arrays and move all to top level
      Object.entries(row).forEach(([key, value]) => {
        // Remove __typename from export (contains table name which is already in filename)
        if (key === "__typename") {
          delete row["__typename"];
        } else if (Array.isArray(value)) {
          // If value is array, recursive call and handle objects in array
          value = formatExportData(value);
          value.forEach(object => {
            Object.entries(object).forEach(([key, value]) => {
              if (row[key]) {
                // If top level already has this key, concat
                row[key] = `${row[key]}, ${value}`;
              } else {
                // Else use spread to add to top level
                row = { ...row, ...object };
              }
            });
            // Delete nested data after added to top level
            delete row[key];
          });
        } else if (typeof value === "object" && value !== null) {
          // If value is object, remove __typename and move to top level, then delete
          "__typename" in value && delete value["__typename"];
          row = { ...row, ...value };
          delete row[key];
        }
      });
      return row;
    });
    return newData;
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
          {query.limit > 4000 && (
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
              filename={query.table + moment(Date.now()).format()}
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
