import React from "react";
import { StoreContext } from "src/constants/context";
import { useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import styled from "styled-components";

import SideDrawerContent from "./SideDrawerContent";
import { colors } from "../../constants/colors";
import { responsive } from "../../constants/responsive";

const drawerWidth = responsive.drawerWidth;

// Styles for MUI drawer
const Root = styled.div`
  display: flex;
`;

const Nav = styled.nav`
  @media (min-width: ${responsive.bootstrapMediumMin}px) {
    width: ${drawerWidth}px;
    flex-shrink: 0;
  }
`;

const StyledDrawerPaper = styled(Drawer)`
  .MuiDrawer-paper {
    width: ${drawerWidth}px;
    background: ${colors.dark};
    color: ${colors.light};
    border: 0;
  }
`;

const StyledDrawer = styled.div`
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
    overflow-y: scroll;
    height: calc(100vh - ${responsive.headerHeight}px);
  }
`;

const SideDrawer = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const theme = useTheme();
  const direction = theme?.direction || "ltr";

  const {
    sidebarToggle: [isOpen, setIsOpen],
  } = React.useContext(StoreContext);

  return (
    <StyledDrawer>
      <Root id={currentPath === "/" ? "summary-side-drawer" : ""}>
        <CssBaseline />
        <Nav aria-label="mobile side drawer">
          <StyledDrawerPaper
            id="temporary-drawer"
            variant="temporary"
            anchor={direction === "rtl" ? "right" : "left"}
            open={isOpen}
            onClose={() => setIsOpen(!isOpen)}

            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            <SideDrawerContent type="temporary" />
          </StyledDrawerPaper>
          <StyledDrawerPaper id="permanent-drawer" variant="permanent" open>
            <SideDrawerContent type="permanent" />
          </StyledDrawerPaper>
        </Nav>
      </Root>
    </StyledDrawer>
  );
};

export default SideDrawer;
