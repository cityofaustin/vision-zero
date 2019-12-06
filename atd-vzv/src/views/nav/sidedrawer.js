import React from "react";
import { A } from "hookrouter";

import { NavItem, NavLink, Nav } from "reactstrap";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import styled from "styled-components";
import { drawer } from "../../constants/drawer";
import { colors } from "../../constants/colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faMap } from "@fortawesome/free-solid-svg-icons";

const drawerWidth = drawer.width;

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
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
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
    background: colors.dark,
    color: colors.light
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  }
}));

const StyledDrawerHeader = styled.div`
  background: ${colors.light};
  color: ${colors.dark};
  padding: 20px;
  height: ${drawer.height}px;
`;

const SideDrawer = ({ toggle, isOpen }) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <nav className={classes.drawer} aria-label="mailbox folders">
        <Hidden smUp implementation="css">
          <Drawer
            variant="temporary"
            anchor={theme.direction === "rtl" ? "right" : "left"}
            open={isOpen}
            onClose={toggle}
            classes={{
              paper: classes.drawerPaper
            }}
            ModalProps={{
              keepMounted: true // Better open performance on mobile.
            }}
          >
            <div className="side-menu">
              <Nav vertical className="list-unstyled pb-3">
                <StyledDrawerHeader>
                  <h3>Vision Zero Viewer</h3>
                </StyledDrawerHeader>

                <NavItem>
                  <NavLink tag={A} href="/">
                    <FontAwesomeIcon icon={faHome} className="mr-2" />
                    Dashboard
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={A} href="/map">
                    <FontAwesomeIcon icon={faMap} className="mr-2" />
                    Map
                  </NavLink>
                </NavItem>
              </Nav>
            </div>
          </Drawer>
        </Hidden>
      </nav>
    </div>
  );
};

export default SideDrawer;
