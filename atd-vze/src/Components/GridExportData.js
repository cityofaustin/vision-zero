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
} from "reactstrap";

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
          <FormGroup row>
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
            <Col sm="4">
              <Input
                className="form-check-input"
                type="checkbox"
                id="csv-checkbox-input"
                name="inline-checkbox1"
                value="option1"
                onChange={setExportLimit}
              />
              <Label
                className="form-check-label"
                check
                htmlFor="inline-checkbox1"
              >
                All ({totalRecords})
              </Label>
            </Col>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          {!loading && data ? (
            <CSVLink
              className=""
              data={data[query.table]}
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
