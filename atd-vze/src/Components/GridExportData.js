import React, { useState } from "react";
import { withApollo } from "react-apollo";
import { useLazyQuery } from "@apollo/react-hooks";
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
} from "reactstrap";

const StyledSaveLink = styled.i`
  color: ${colors.info};
  cursor: pointer;
  :hover {
    color: ${colors.primary};
  }
`;

const GridExportData = ({ query, columnsToExport }) => {
  // Copy query instance to modify config for CSV export only
  const queryCSV = query;

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Make CSV Query && Error handling
  // Use .queryCSV to insert columnsToExport passed to GridTable component into query
  let [getExport, { loading, data }] = useLazyQuery(
    queryCSV.queryCSV(columnsToExport)
  );

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const toggleModalAndExport = () => {
    setIsModalOpen(!isModalOpen);
    getExport();
  };

  const setExportLimit = () => {
    queryCSV.limit = 2000;
    getExport();
  };
  console.log(data);
  return (
    <>
      <StyledSaveLink>
        <i
          className="fa fa-save fa-2x ml-2 mt-1"
          onClick={toggleModalAndExport}
        />
      </StyledSaveLink>

      <Modal isOpen={isModalOpen} toggle={toggleModal} className={"modal-sm "}>
        <ModalHeader toggle={toggleModal}>Export to .csv</ModalHeader>
        <ModalBody>
          Put save options here
          <Button color="primary" onClick={setExportLimit}>
            Debug
          </Button>
        </ModalBody>
        <ModalFooter>
          {!loading && data ? (
            <CSVLink
              className=""
              data={data[query.table]}
              filename={query.table + Date.now()}
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
