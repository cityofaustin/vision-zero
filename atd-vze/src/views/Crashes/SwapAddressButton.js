import React, { useState } from "react";
import { Button } from "reactstrap";
import ConfirmModal from "../../Components/ConfirmModal";

const SwapAddressButton = () => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const toggleModal = () => {
    setIsConfirmModalOpen(!isConfirmModalOpen);
  };

  return (
    <td>
      <Button color="primary" onClick={toggleModal}>
        Swap Address
      </Button>
      <ConfirmModal
        showModal={isConfirmModalOpen}
        toggleModal={toggleModal}
        modalHeader={"Swap addresses?"}
        modalBody={
          "Are you sure you want to swap the primary and secondary address?"
        }
      ></ConfirmModal>
    </td>
  );
};

export default SwapAddressButton;
