import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

const DataModal = () => {
  const [modal, setModal] = useState(true);
  const toggle = () => setModal(!modal);

  return (
    <Modal isOpen={modal} toggle={toggle}>
      <ModalHeader toggle={toggle}>Vision Zero Viewer</ModalHeader>
      <ModalBody>
        <h3 className="h4">Data Quality Disclaimer</h3>
        Please note that the information currently being displayed may be
        outdated or inaccurate. Crash data obtained from the Texas Department of
        Transportation (TxDOT) Crash Record Information System (CRIS) database
        is currently being reprocessed. This process could affect fatality and
        serious injury numbers and locations. Please refrain from performing any
        critical data analysis at this time.
      </ModalBody>
      <ModalFooter>
        <Button color="dark" onClick={toggle}>
          Thanks
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DataModal;
