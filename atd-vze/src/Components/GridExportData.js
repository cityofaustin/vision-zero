import React, { useState, useEffect } from "react";
import { withApollo } from "react-apollo";
import { CSVLink } from "react-csv";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

const GridExportData = ({ exportData, query }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <>
      <i className="fa fa-save fa-2x ml-2 mt-1" onClick={toggleModal} />
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
