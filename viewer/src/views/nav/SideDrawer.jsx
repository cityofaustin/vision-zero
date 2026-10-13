import React from "react";
import { StoreContext } from "src/constants/context";
import { useLocation } from "react-router-dom";

import styled from "styled-components";

import SideDrawerContent from "./SideDrawerContent";
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

  /* Keep logo fixed and scroll content below */
  .MuiDrawer-paper {
    overflow-y: unset;
  }

  /* Allow user to scroll when drawer content height exceeds device viewport */
  .drawer-content {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    height: calc(100vh - ${responsive.headerHeight}px);
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

const TemporaryDrawer = styled.div`
  background-color: green;
    top: 0;
  left: 0;
  bottom: 0;
  width: ${drawerWidth}px;
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
            variant="temporary"
            open={isOpen}
            onClose={() => setIsOpen(!isOpen)}
            ModalProps={{
              keepMounted: true,
            }}
          >
            <SideDrawerContent type="temporary" />
          </TemporaryDrawer>
          <PermanentDrawer>
            <SideDrawerContent type="permanent" />
          </PermanentDrawer>
        </Nav>
      </Root>
    </StyledDrawerContainer>
  );
};

export default SideDrawer;
