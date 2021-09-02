import React from "react";
import { StoreContext } from "../../utils/store";
import { A, usePath } from "hookrouter";

import { Container, Navbar, Button, Nav, NavItem, NavLink } from "reactstrap";
import styled from "styled-components";
import { navConfig, trackPageEvent } from "../../constants/nav";
import { responsive } from "../../constants/responsive";
import { colors } from "../../constants/colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

const Header = () => {
  const currentPath = usePath();
  const isSummaryView = currentPath === "/";

  const StyledNavbar = styled.div`
  .header-navbar {
    /* Keep Navbar same height as header in SideDrawer and move to right based on drawer width */
    min-height: ${responsive.headerHeight}px;
    ${currentPath !== "/" && `left: ${responsive.drawerWidth}px;`}
    background-color: ${colors.white};
    @media only screen and (max-width: ${responsive.bootstrapMedium}px) {
      /* Fill full width of screen with header on mobile */
      left: 0;
      min-height: ${responsive.headerHeightMobile}px;
    }
  }

  .navbar-links {
    @media only screen and (max-width: ${responsive.bootstrapMedium}px) {
      display: none;
    }
  }

  .nav-button {
    /* Set width to keep buttons equal width */
    width: ${responsive.headerButtonWidth}px;
    height: ${responsive.headerButtonHeight}px;
    font-size: 18px;
  }

  .inactive-nav-button {
    color: ${colors.white};
    background: ${colors.infoDark};
    opacity: 1;
    margin-left: 5px;
    margin-right: 5px;
    :hover {
      background: ${colors.info};
    }
  }

  .sidedrawer-toggle {
    /* Hide toggle button in header when SideDrawer is open by default */
    @media only screen and (min-width: ${responsive.bootstrapMediumMin}px) {
      display: none;
    }
  }

  .vz-logo-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .vz-logo {
    /* Need to offset height to account for white space above and below logo in svg */
    height: ${responsive.headerButtonHeight + responsive.headerLogoOffset}px;
    
    @media only screen and (max-width: ${responsive.bootstrapMedium}px) {
      /* Center VZ logo and only show when toggler is present */
      transform: translateX(-50%);
      left: 50%;
      position: absolute;
      height: ${responsive.headerButtonHeight}px;
    }

    /* Hide logo in header when SideDrawer is closed and toggle is present (mobile)
    but show in Summary view at all times */
    @media only screen and (min-width: ${responsive.bootstrapMediumMin}px) {
      ${currentPath !== "/" && "display: none;"}
    }
  }
`;

  // Use context to toggle state for SideDrawer toggle
  const {
    sidebarToggle: [isOpen, setIsOpen],
  } = React.useContext(StoreContext);

  return (
    <header role="banner">
      <StyledNavbar>
        <Navbar
          light
          className="navbar shadow-sm fixed-top header-navbar px-0"
          expand="md"
        >
          <Container
            fluid
            // In Summary view, match padding and margins of Summary content below
            className={`${
              isSummaryView
                ? "px-xs-0 mx-xs-0 pl-md-2 pr-md-1 px-lg-3 mx-lg-4"
                : "px-0"
            }`}
          >
            <Button
              className="ml-3 sidedrawer-toggle"
              color="dark"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="sr-only">Menu Button</span>
              <FontAwesomeIcon icon={faBars} />
            </Button>
            <div className="vz-logo-wrapper">
              <h1 className="sr-only">
                Vision Zero -- Help Austin reach zero traffic deaths
              </h1>
              <img
                className="vz-logo pl-lg-3"
                // Need to adjust location of public folder to account for /viewer/ basepath
                src={process.env.PUBLIC_URL + "/vz_logo.svg"}
                alt="Vision Zero Austin Logo"
              ></img>
            </div>
            <Nav
              className={`navbar-links ml-auto ${
                isSummaryView ? "px-lg-3" : "px-3"
              }`}
              navbar
            >
              {navConfig.map(
                (config, i) =>
                  currentPath !== config.url && (
                    <NavItem key={i}>
                      <NavLink
                        tag={A}
                        href={config.url}
                        className="pr-0 pl-2 mr-0 ml-2"
                      >
                        <Button
                          className={`nav-button inactive-nav-button mx-xs-0 mx-lg-2`}
                          onClick={() => trackPageEvent(config.eventKey)}
                          active={currentPath === config.url}
                        >
                          {config.icon}
                          <span className="pl-2">{config.title}</span>
                        </Button>
                      </NavLink>
                    </NavItem>
                  )
              )}
            </Nav>
          </Container>
        </Navbar>
      </StyledNavbar>
    </header>
  );
};

export default Header;
