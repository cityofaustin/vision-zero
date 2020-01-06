import React from "react";
import { StoreContext } from "../../utils/store";

import { Nav, Alert } from "reactstrap";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import styled from "styled-components";
import { drawer } from "../../constants/drawer";
import { colors } from "../../constants/colors";
import SideMapControl from "./SideMapControl";

const drawerWidth = drawer.width;

// Styles for MUI drawer
const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  },
  drawer: {
    [theme.breakpoints.up("md")]: {
      width: drawerWidth,
      flexShrink: 0
    }
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none"
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
}));

const StyledDrawerHeader = styled.div`
  background-color: ${colors.light};
  color: ${colors.dark};
  padding: 20px;
  height: ${drawer.height}px;

  .logo {
    position: absolute;
    width: ${drawer.width}px;
    left: 0;
    top: 35px;
  }
`;

const SideDrawer = () => {
  const classes = useStyles();
  const theme = useTheme();

  const {
    sidebarToggle: [isOpen, setIsOpen]
  } = React.useContext(StoreContext);

  const drawerContent = (
    <div className="side-menu">
      <StyledDrawerHeader>
        <img
          className="logo"
          src="vz_logo.png"
          alt="Vision Zero Austin Logo"
        ></img>
      </StyledDrawerHeader>
      {/* TODO: Remove disclaimer  */}
      <Nav vertical className="list-unstyled pb-3">
        <Alert color="danger" className="m-2 p-1">
          <strong>This site is a work in progress.</strong>
          <br />
          <span>
            The information displayed may be outdated or incorrect. Check back
            later for live Vision Zero data.
          </span>
        </Alert>
      </Nav>
    </div>
  );

  return (
    <div className={classes.root}>
      <CssBaseline />
      <nav className={classes.drawer} aria-label="mailbox folders">
        <Hidden mdUp implementation="css">
          <Drawer
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
            <SideMapControl />
          </Drawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper
            }}
            variant="permanent"
            open
          >
            {drawerContent}
            {/* TODO: Dynamic sidebar content based on route */}
            <SideMapControl />
          </Drawer>
        </Hidden>
      </nav>
    </div>
  );
};

export default SideDrawer;
