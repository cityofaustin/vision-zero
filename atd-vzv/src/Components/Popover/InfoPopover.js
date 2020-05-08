import React from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const InfoPopover = ({ config }) => {
  const StyledPopover = styled.div`
    font-size: 12px;
  `;

  const StyledInfoIcon = styled.span`
    cursor: pointer;
  `;

  const content = <StyledPopover>{config.html}</StyledPopover>;

  return (
    <Tippy
      content={content}
      placement={"bottom"}
      trigger={"click"}
      appendTo={document.body} // Avoid side scroll in SideMapControl popovers
      interactive={true}
    >
      <StyledInfoIcon>
        <FontAwesomeIcon className="info-icon" icon={faInfoCircle} />
      </StyledInfoIcon>
    </Tippy>
  );
};

export default InfoPopover;
