import React from "react";
import { UncontrolledPopover, PopoverHeader, PopoverBody } from "reactstrap";
import { StoreContext } from "../../utils/store";
import styled from "styled-components";

const InfoPopover = ({ popoverTarget }) => {
  // TODO: Create custom hook to inject popover into DOM
  // TODO: Args - id of target, obj with text/icons/etc, action (hover, click, etc.)
  const {
    sidebarToggle: [isOpen],
  } = React.useContext(StoreContext);

  const StyledPopover = styled.div`
    /* Set z-index higher than MUI Drawer default */
    z-index: 1400;
  `;

  const drawerId = isOpen ? "temporary-drawer" : "permanent-drawer";

  const modifiers = {
    preventOverflow: {
      enabled: false,
    },
  };

  const content = (
    <>
      <div className="mb-2">
        Crash data is obtained from the Texas Department of Transportation
        (TXDOT) Crash Record Information System (CRIS) database, which is
        populated by Austin Police Department (APD) data and maintained by
        TXDOT.
      </div>
      <div className="mb-2">
        The geographic boundaries used to collect and display crash data in the
        Vision Zero Viewer is the City of Austin city limit boundaries.
        **explanation of why these numbers may be different from APD's
        numbers.**
      </div>
      <div className="mb-2">
        Crash data in Vision Zero Viewer is updated at the end of each month.{" "}
      </div>
      <div className="mb-2">
        Crashes are mapped in Vision Zero Viewer using the lat/longs that have
        been reported in the CRIS database. In some cases, the City of Austin
        has manually updated locations based on.{" "}
      </div>
      <div className="mb-2">
        Please note that the data and information on this website is for
        informational purposes only. While we seek to provide accurate
        information, please note that errors may be present and information
        presented may not be complete.
      </div>
    </>
  );

  return (
    <StyledPopover id={`${popoverTarget}-parent`}>
      <UncontrolledPopover
        placement="bottom"
        target={() => document.querySelector(`#${drawerId} #${popoverTarget}`)}
        trigger="click" // Action here
        // Set popover to render within styled component so we can select/style it
        container={() =>
          document.querySelector(`#${drawerId} #${popoverTarget}-parent`)
        }
        modifiers={modifiers}
      >
        <PopoverHeader>Traffic Crashes</PopoverHeader>
        <PopoverBody>{content}</PopoverBody>
      </UncontrolledPopover>
    </StyledPopover>
  );
};

export default InfoPopover;
