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

  const isMobile = useIsMobile();

  const content = <StyledPopover>{config.html}</StyledPopover>;

  const [modal, setModal] = useState(false);

  const toggle = () => setModal(!modal);

  return !isMobile ? (
    <Tippy
      content={content}
      placement={"auto"} // allowAutoPlacements set below
      trigger={"click"}
      appendTo={document.body} // Avoid side scroll in SideMapControl popovers
      interactive={true}
      maxWidth={
        isMobile
          ? responsive.infoPopoverMobileWidth
          : responsive.infoPopoverFullWidth
      } // Prevent mobile popover from taking up full drawer
      offset={isMobile ? [30, 5] : [0, 5]} // Prevent mobile popover covering mobile drawer and preventing scroll nav
      popperOptions={{
        modifiers: [
          {
            name: "flip",
            options: {
              allowedAutoPlacements: ["top", "bottom"], // Prevent popover from rendering off-screen
            },
          },
        ],
      }}
    >
      <StyledInfoIcon>
        <FontAwesomeIcon className="info-icon" icon={faInfoCircle} />
      </StyledInfoIcon>
    </Tippy>
  ) : (
    <span>
      <FontAwesomeIcon icon={faInfoCircle} onClick={toggle} />
      <Modal isOpen={modal} toggle={toggle} zIndex={1305} scrollable autoFocus>
        <span className="text-right mt-2 mr-2">
          <FontAwesomeIcon icon={faTimesCircle} size="2x" onClick={toggle} />
        </span>
        <ModalBody className="pt-0">{content}</ModalBody>
      </Modal>
    </span>
  );
};

export default InfoPopover;
