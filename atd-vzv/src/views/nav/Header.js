import React, { useState } from "react";
import { StoreContext } from "../../utils/store";
import { A, usePath } from "hookrouter";

import {
  Container,
  Navbar,
  Button,
  Nav,
  NavItem,
  NavLink,
  Collapse,
  Row,
  Col
} from "reactstrap";
import styled from "styled-components";
import { drawer } from "../../constants/drawer";
import { responsive } from "../../constants/responsive";
import { colors } from "../../constants/colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

const StyledNavbar = styled.div`
  .navbar-container {
    /* Make Navbar container same height as SideDrawer header */
    height: ${drawer.headerHeight}px;
  }

  .header-navbar {
    /* Keep Navbar same height as header in SideDrawer and move to right based on drawer width */
    min-height: ${drawer.headerHeight}px;
    left: ${drawer.width}px;
    background-color: ${colors.white};
    @media only screen and (max-width: ${responsive.materialMedium}px) {
      /* When SideDrawer collapses, move header to left of window */
      left: 0;
    }

    @media only screen and (max-width: ${responsive.bootstrapMedium}px) {
      /* Keep Navbar toggles centered vertically in header when Nav toggle appears */
      /* NavbarToggler is 40px in height */
      padding-top: ${(drawer.headerHeight - 40) / 2}px !important;
      padding-bottom: ${(drawer.headerHeight - 40) / 2}px !important;
    }
  }

  .nav-button {
    /* Set width to keep buttons equal width */
    width: 140px;
  }

  .sidedrawer-toggle {
    /* Hide toggle button in header when SideDrawer is open by default */
    @media only screen and (min-width: ${responsive.materialMedium}px) {
      display: none;
    }
  }

  .vz-logo {
    /* Center VZ logo and only show when toggler is present */
    transform: translateX(-50%);
    left: 50%;
    position: absolute;

    /* Hide logo in header when SideDrawer is closed and toggle is present (mobile) */
    @media only screen and (min-width: ${responsive.bootstrapMedium}px) {
      display: none;
    }
  }
`;

const navConfig = [
  {
    title: "Summary",
    url: "/summary"
  },
  { title: "Map", url: "/map" }
];

const Header = () => {
  const currentPath = usePath();

  // Use context to toggle state for SideDrawer toggle
  const {
    sidebarToggle: [isOpen, setIsOpen]
  } = React.useContext(StoreContext);

  return (
    <StyledNavbar>
      <Container className="navbar-container" fluid>
        <Navbar
          light
          className="navbar shadow-sm p-3 rounded fixed-top header-navbar"
          expand="md"
        >
          <Button
            className="mr-2 sidedrawer-toggle"
            color="info"
            onClick={() => setIsOpen(!isOpen)}
          >
            <FontAwesomeIcon icon={faBars} />
          </Button>
          <Collapse className="float-right" navbar>
            <Nav className="mr-auto" navbar>
              {navConfig.map((config, i) => (
                <NavItem key={i}>
                  <NavLink tag={A} href={config.url}>
                    {currentPath === config.url ? (
                      <Button className="nav-button btn-dark">
                        {config.title}
                      </Button>
                    ) : (
                      <Button outline className="nav-button btn-outline-dark">
                        {config.title}
                      </Button>
                    )}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
          </Collapse>
          <img
            className="vz-logo"
            src="vz_logo.png"
            alt="Vision Zero Austin Logo"
          ></img>
        </Navbar>
      </Container>
    </StyledNavbar>
  );
};

export default Header;
