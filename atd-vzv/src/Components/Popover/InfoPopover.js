import React from "react";
import { UncontrolledPopover, PopoverHeader, PopoverBody } from "reactstrap";
import styled from "styled-components";

const InfoPopover = ({ popoverTarget }) => {
  // TODO: Create custom hook to inject popover into DOM
  // TODO: Args - id of target, obj with text/icons/etc
  const StyledPopover = styled.div`
    z-index: 1400;
  `;

  return (
    <StyledPopover id="popper-parent">
      <UncontrolledPopover
        placement="bottom"
        target={popoverTarget}
        trigger="click"
        container={() => document.getElementById("popper-parent")}
      >
        <PopoverHeader>Popover Title</PopoverHeader>
        <PopoverBody>
          Sed posuere consectetur est at lobortis. Aenean eu leo quam.
          Pellentesque ornare sem lacinia quam venenatis vestibulum.
        </PopoverBody>
      </UncontrolledPopover>
    </StyledPopover>
  );
};

export default InfoPopover;
