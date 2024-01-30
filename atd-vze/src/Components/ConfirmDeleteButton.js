import React, { useState } from "react";
import { Button } from "reactstrap";
import ConfirmModal from "./ConfirmModal.js";

const ConfirmDeleteButton = ({ onConfirmClick, modalHeader, modalBody }) => {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <>
      <Button
        type="submit"
        color="secondary"
        className="btn-pill mt-2"
        size="sm"
        style={{ width: "50px" }}
        onClick={toggleModal}
      >
        <i className="fa fa-trash" />
      </Button>
      <ConfirmModal
        modalHeader={modalHeader}
        modalBody={modalBody}
        confirmClick={onConfirmClick}
        toggleModal={toggleModal}
        showModal={showModal}
      />
    </>
  );
};

export default ConfirmDeleteButton;
