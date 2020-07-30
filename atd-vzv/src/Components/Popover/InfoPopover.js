import React, { useState } from "react";
import { Modal, ModalBody } from "reactstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../constants/colors";

const InfoPopover = ({ config }) => {
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);

  const StyledModalContent = styled.div`
    font-size: 12px;
    padding: 3px;

    /* Style links for devices that show them as plain text */
    a {
      color: ${colors.viridis2Of6};
      text-decoration: underline;
    }
  `;

  const StyledInfoIcon = styled.span`
    .modal-button {
      cursor: pointer;
    }
  `;

  const content = <StyledModalContent>{config.html}</StyledModalContent>;

  return (
    <StyledInfoIcon>
      <FontAwesomeIcon
        className="modal-button"
        icon={faInfoCircle}
        onClick={toggle}
      />
      <Modal
        isOpen={modal}
        toggle={toggle}
        zIndex={1305} // Set z-index to supercede SideDrawer and SideMapControlDateRange components
        scrollable
        autoFocus
      >
        <StyledInfoIcon className="text-right mt-2 mr-2">
          <FontAwesomeIcon
            className="modal-button"
            icon={faTimesCircle}
            size="2x"
            onClick={toggle}
          />
        </StyledInfoIcon>
        <ModalBody className="pt-0">{content}</ModalBody>
      </Modal>
    </StyledInfoIcon>
  );
};

export default InfoPopover;
