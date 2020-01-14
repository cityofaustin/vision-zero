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
  NavbarToggler
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

  .collapse-toggle {
    /* Hide SideBar toggle when SideBar is not collapsed */
    @media only screen and (min-width: ${responsive.materialMedium}px) {
      display: none;
    }
  }

  .nav-button {
    /* Set width to keep buttons equal width */
    width: 140px;
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
  // Set toggle state for navigation
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggle = () => setIsNavOpen(!isNavOpen);

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
            className="mr-2 collapse-toggle"
            color="info"
            onClick={() => setIsOpen(!isOpen)}
          >
            <FontAwesomeIcon icon={faBars} />
          </Button>
          <NavbarToggler onClick={toggle} />
          <Collapse className="float-right" isOpen={isNavOpen} navbar>
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
        </Navbar>
      </Container>
    </StyledNavbar>
  );
};

export default Header;
