import React, { useState } from "react";

import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const WarningModal = ({ modalHeader, modalBody }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Modal isOpen={isOpen} toggle={toggleModal} className={"modal-danger"}>
      <ModalHeader toggle={toggleModal}>{modalHeader}</ModalHeader>
      <ModalBody>{modalBody}</ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={toggleModal}>
          Do Something
        </Button>{" "}
        <Button color="secondary" onClick={toggleModal}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default WarningModal;
