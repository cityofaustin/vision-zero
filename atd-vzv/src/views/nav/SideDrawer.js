import React from "react";
import { StoreContext } from "../../utils/store";
import { usePath } from "hookrouter";

import SideMapControl from "./SideMapControl";
import { Container, Alert } from "reactstrap";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import styled from "styled-components";
import { drawer } from "../../constants/drawer";
import { colors } from "../../constants/colors";
import { responsive } from "../../constants/responsive";
import SideDrawerMobileNav from "./SideDrawerMobileNav";

const drawerWidth = drawer.width;

// Styles for MUI drawer
const useStyles = makeStyles(theme => {
  return {
    root: {
      display: "flex"
    },
    drawer: {
      // Feed drawer component a media query to align with Bootstrap breakpoints
      [`@media (min-width:${responsive.bootstrapMediumMin}px)`]: {
        width: drawerWidth,
        flexShrink: 0
      }
    },
    drawerPaper: {
      width: drawerWidth,
      background: colors.dark,
      color: colors.light,
      border: 0
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3)
    }
  };
});

const StyledDrawerHeader = styled.div`
  background-color: ${colors.white};
  color: ${colors.dark};
  padding: 20px;
  height: ${drawer.headerHeight}px;
  display: flex;
  align-items: center;
  justify-content: center;
  @media only screen and (max-width: ${responsive.bootstrapMedium}px) {
    display: none;
  }
`;

const StyledDrawer = styled.div`
  #temporary-drawer {
    @media only screen and (min-width: ${responsive.bootstrapMediumMin}px) {
      display: none;
    }
  }

  #permanent-drawer {
    @media only screen and (max-width: ${responsive.bootstrapMedium}px) {
      display: none;
    }
  }
`;

const SideDrawer = () => {
  const currentPath = usePath();
  const classes = useStyles();
  const theme = useTheme();

  const {
    sidebarToggle: [isOpen, setIsOpen]
  } = React.useContext(StoreContext);

  const drawerContent = (
    <div className="side-menu">
      <StyledDrawerHeader>
        {/* Need to adjust location of public folder to account for /viewer/ basepath */}
        <img src="../vz_logo.png" alt="Vision Zero Austin Logo"></img>
      </StyledDrawerHeader>
      <Container className="pt-3 pb-3">
        <SideDrawerMobileNav />
        {/* TODO: Remove disclaimer when going live */}
        <Alert color="danger">
          <strong>This site is a work in progress.</strong>
          <br />
          <span>
            The information displayed may be outdated or incorrect. Check back
            later for live Vision Zero data.
          </span>
        </Alert>
        {currentPath === "/map" && <SideMapControl />}
      </Container>
    </div>
  );

  return (
    <div className={classes.root}>
      <CssBaseline />
      <nav className={classes.drawer} aria-label="mailbox folders">
        <StyledDrawer>
          <Drawer
            id="temporary-drawer"
            variant="temporary"
            anchor={theme.direction === "rtl" ? "right" : "left"}
            open={isOpen}
            onClose={() => setIsOpen(!isOpen)}
            classes={{
              paper: classes.drawerPaper
            }}
            ModalProps={{
              keepMounted: true // Better open performance on mobile.
            }}
          >
            {drawerContent}
          </Drawer>
          <Drawer
            classes={{
              paper: classes.drawerPaper
            }}
            id="permanent-drawer"
            variant="permanent"
            open
          >
            {drawerContent}
          </Drawer>
        </StyledDrawer>
      </nav>
    </div>
  );
};

export default SideDrawer;
