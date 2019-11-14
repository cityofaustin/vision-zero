import React from "react";

import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const ConfirmModal = ({
  modalHeader,
  modalBody,
  confirmClick,
  toggleModal,
  showModal,
}) => {
  // Hide modal and call button click handler on confirm
  const handleConfirm = e => {
    toggleModal();
    confirmClick(e);
  };

  return (
    <Modal isOpen={showModal} toggle={toggleModal} className={"modal-danger"}>
      <ModalHeader toggle={toggleModal}>{modalHeader}</ModalHeader>
      <ModalBody>{modalBody}</ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={handleConfirm}>
          Confirm
        </Button>{" "}
        <Button color="secondary" onClick={toggleModal}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmModal;
