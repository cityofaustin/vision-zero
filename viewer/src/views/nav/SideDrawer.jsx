import React from "react";
import { StoreContext } from "../../utils/store";
import { usePath } from "hookrouter";

import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import styled from "styled-components";

import SideDrawerContent from "./SideDrawerContent";
import { colors } from "../../constants/colors";
import { responsive } from "../../constants/responsive";

const drawerWidth = responsive.drawerWidth;

// Styles for MUI drawer
const useStyles = makeStyles((theme) => {
  return {
    root: {
      display: "flex",
    },
    drawer: {
      // Feed drawer component a media query to align with Bootstrap breakpoints
      [`@media (min-width:${responsive.bootstrapMediumMin}px)`]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    drawerPaper: {
      width: drawerWidth,
      background: colors.dark,
      color: colors.light,
      border: 0,
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
  };
});

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
  const currentPath = usePath();
  const classes = useStyles();
  const theme = useTheme();

  const {
    sidebarToggle: [isOpen, setIsOpen],
  } = React.useContext(StoreContext);

  return (
    <StyledDrawer>
      <div
        className={classes.root}
        // Disable side drawer in non-mobile viewport
        id={currentPath === "/" ? "summary-side-drawer" : ""}
      >
        <CssBaseline />
        <nav className={classes.drawer} aria-label="mobile side drawer">
          <Drawer
            id="temporary-drawer"
            variant="temporary"
            anchor={theme.direction === "rtl" ? "right" : "left"}
            open={isOpen}
            onClose={() => setIsOpen(!isOpen)}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            <SideDrawerContent type="temporary" />
          </Drawer>
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            id="permanent-drawer"
            variant="permanent"
            open
          >
            <SideDrawerContent type="permanent" />
          </Drawer>
        </nav>
      </div>
    </StyledDrawer>
  );
};

export default SideDrawer;
