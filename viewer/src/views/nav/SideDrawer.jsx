import React from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { Offcanvas, OffcanvasBody, OffcanvasHeader } from "reactstrap";
import SideDrawerContent from "./SideDrawerContent";
import { StoreContext } from "src/constants/context";
import { colors } from "src/constants/colors";
import { responsive } from "src/constants/responsive";

const drawerWidth = responsive.drawerWidth;

const Root = styled.div`
  display: flex;
`;

const Nav = styled.nav`
  @media (min-width: ${responsive.bootstrapMediumMin}px) {
    width: ${drawerWidth}px;
    flex-shrink: 0;
  }
`;

const StyledDrawerContainer = styled.div`
  /* Hide side drawer in desktop viewport on summary page */
  #summary-side-drawer {
    @media only screen and (min-width: ${responsive.bootstrapMedium}px) {
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

const DesktopDrawer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: ${drawerWidth}px;
  background: ${colors.light};
  display: flex;
  flex-direction: column;
  z-index: 1200;
  /* Show permanent drawer medium breakpoint and up */
  @media only screen and (max-width: ${responsive.bootstrapMedium}px) {
    display: none;
  }
`;

const MobileDrawer = styled(Offcanvas)`
  background: ${colors.light};
  // !important included in order to override the offcanvas width
  width: 100% !important;
  .offcanvas-body {
    padding: 0;
  }
  /* Show mobile drawer medium breakpoint and down */
  @media only screen and (min-width: ${responsive.bootstrapMediumMin}px) {
    display: none;
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
      <Root id={currentPath === "/" ? "summary-side-drawer" : undefined}>
        <Nav>
          <MobileDrawer
            isOpen={isOpen}
            toggle={() => setIsOpen(false)}
            fade={false}
          >
            <OffcanvasHeader toggle={() => setIsOpen(false)} />
            <OffcanvasBody>
              <SideDrawerContent type="temporary" currentPath={currentPath} />
            </OffcanvasBody>
          </MobileDrawer>
          <DesktopDrawer>
            <SideDrawerContent type="permanent" currentPath={currentPath} />
          </DesktopDrawer>
        </Nav>
      </Root>
    </StyledDrawerContainer>
  );
};

export default SideDrawer;
