import React from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { Offcanvas, OffcanvasBody } from "reactstrap";
import SideDrawerContent from "./SideDrawerContent";
import { StoreContext } from "src/constants/context";
import { colors } from "src/constants/colors";
import { responsive } from "src/constants/responsive";

const drawerWidth = responsive.drawerWidth;

const Root = styled.div`
  display: flex;
`;

const Nav = styled("nav")`
  @media (min-width: ${responsive.bootstrapMediumMin}px) {
    width: ${drawerWidth}px;
    flex-shrink: 0;
  }
`;

const StyledDrawerContainer = styled.div`
  /* Disable side drawer in desktop viewport */
  #summary-side-drawer {
    @media only screen and (min-width: ${responsive.bootstrapMedium}px) {
      display: none;
    }
  }

  /* Show mobile drawer medium breakpoint and down */
  #temporary-drawer {
    @media only screen and (min-width: ${responsive.bootstrapMediumMin}px) {
      display: none;
    }
  }

  /* Show permanent drawer medium breakpoint and up */
  #permanent-drawer {
    @media only screen and (max-width: ${responsive.bootstrapMedium}px) {
      display: none;
    }
  }

  /* Allow user to scroll when drawer content height exceeds device viewport */
  .drawer-content {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    height: calc(100dvh - ${responsive.headerHeight}px);
  }
`;

const PermanentDrawer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: ${drawerWidth}px;
  background: ${colors.light};
  display: flex;
  flex-direction: column;
  z-index: 1200;
  @media only screen and (max-width: ${responsive.bootstrapMedium}px) {
    display: none;
  }
`;

const TemporaryDrawer = styled(Offcanvas)`
  background: ${colors.light};
  // important in order to override the offcanvas width
  width: 100% !important;
  .offcanvas-body {
    padding: 0;
  }
`;

const SideDrawer = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const {
    sidebarToggle: [isOpen, setIsOpen],
  } = React.useContext(StoreContext);

  return (
    <StyledDrawerContainer>
      <Root id={currentPath === "/" ? "summary-side-drawer" : ""}>
        <Nav>
          <TemporaryDrawer
            id="temporary-drawer"
            isOpen={isOpen}
            toggle={() => setIsOpen(false)}
          >
            <OffcanvasBody>
              <SideDrawerContent type="temporary" currentPath={currentPath} />
            </OffcanvasBody>
          </TemporaryDrawer>
          <PermanentDrawer>
            <SideDrawerContent type="permanent" currentPath={currentPath} />
          </PermanentDrawer>
        </Nav>
      </Root>
    </StyledDrawerContainer>
  );
};

export default SideDrawer;
