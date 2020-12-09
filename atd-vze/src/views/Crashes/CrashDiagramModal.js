import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";

const CrashDiagramModal = ({ buttonTitle, modalTitle, modalText }) => {
  const [modal, setModal] = useState(false);

  const toggle = () => setModal(!modal);

  return (
    <div>
      <Button color="primary" style={{ float: "right" }} onClick={toggle}>
        {buttonTitle}
      </Button>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>{modalTitle}</ModalHeader>
        <ModalBody>{modalText}</ModalBody>
      </Modal>
    </div>
  );
};

export default CrashDiagramModal;
