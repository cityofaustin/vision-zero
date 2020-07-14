import React, { useState } from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { Modal, ModalBody } from "reactstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../constants/colors";
import { responsive } from "../../constants/responsive";
import { useIsMobile } from "../../constants/responsive";

const InfoPopover = ({ config }) => {
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  const isMobile = useIsMobile();

  const StyledPopover = styled.div`
    font-size: 12px;
    padding: 3px;

    /* Style links for devices that show them as plain text */
    a {
      color: ${colors.info};
      text-decoration: underline;
    }
  `;

  const StyledInfoIcon = styled.span`
    cursor: pointer;
  `;

  const content = <StyledPopover>{config.html}</StyledPopover>;

  return (
    <span>
      <FontAwesomeIcon icon={faInfoCircle} onClick={toggle} />
      <Modal
        isOpen={modal}
        toggle={toggle}
        zIndex={1305} // Set z-index to supercede SideDrawer and SideMapControlDateRange components
        scrollable
        autoFocus
      >
        <StyledInfoIcon className="text-right mt-2 mr-2">
          <FontAwesomeIcon icon={faTimesCircle} size="2x" onClick={toggle} />
        </StyledInfoIcon>
        <ModalBody className="pt-0">{content}</ModalBody>
      </Modal>
    </span>
  );
};

export default InfoPopover;
