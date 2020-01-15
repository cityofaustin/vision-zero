import React from "react";
import { StoreContext } from "../../utils/store";
import { A, usePath } from "hookrouter";

import { Container, Navbar, Button, Nav, NavItem, NavLink } from "reactstrap";
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
    @media only screen and (max-width: ${responsive.bootstrapMedium}px) {
      /* When SideDrawer collapses, move header to left of window */
      left: 0;
    }
  }

  .navbar-links {
    @media only screen and (max-width: ${responsive.bootstrapMedium}px) {
      display: none;
    }
  }

  .nav-button {
    /* Set width to keep buttons equal width */
    width: 140px;
  }

  .sidedrawer-toggle {
    /* Hide toggle button in header when SideDrawer is open by default */
    @media only screen and (min-width: ${responsive.bootstrapMedium}px) {
      display: none;
    }
  }

  .vz-logo-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
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

    /* Change position to prevent overlap of logo and toggle button on small devices */
    @media only screen and (max-width: ${responsive.bootstrapExtraSmall}px) {
      position: relative;
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
          <div className="vz-logo-wrapper">
            <img
              className="vz-logo"
              src="vz_logo.png"
              alt="Vision Zero Austin Logo"
            ></img>
          </div>
          <Nav className="navbar-links" navbar>
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
        </Navbar>
      </Container>
    </StyledNavbar>
  );
};

export default Header;
