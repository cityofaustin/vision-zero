import React, { useState, useEffect } from "react";
import { withApollo } from "react-apollo";
import { CSVLink } from "react-csv";
import styled from "styled-components";
import { colors } from "../styles/colors";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

const StyledSaveLink = styled.i`
  color: ${colors.info};
  cursor: pointer;
  :hover {
    color: ${colors.primary};
  }
`;

const GridExportData = ({ exportData, query }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <>
      <StyledSaveLink>
        <i className="fa fa-save fa-2x ml-2 mt-1" onClick={toggleModal} />
      </StyledSaveLink>

      <Modal isOpen={isModalOpen} toggle={toggleModal} className={"modal-sm "}>
        <ModalHeader toggle={toggleModal}>Export to .csv</ModalHeader>
        <ModalBody>Put save options here</ModalBody>
        <ModalFooter>
          <CSVLink
            className=""
            data={exportData[query.table]}
            filename={query.table + Date.now()}
          >
            <Button color="primary" onClick={toggleModal}>
              Save
            </Button>
          </CSVLink>{" "}
          <Button color="secondary" onClick={toggleModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default withApollo(GridExportData);
