import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Nav, NavItem, NavLink } from "reactstrap";
import { navConfig, trackPageEvent } from "../../constants/nav";
import { responsive } from "../../constants/responsive";
import { colors } from "../../constants/colors";
import styled from "styled-components";

const StyledMobileNav = styled.div`
  @media only screen and (min-width: ${responsive.bootstrapMediumMin}px) {
    display: none;
  }

  .nav-button {
    height: ${responsive.headerButtonHeight}px;
    font-size: 18px;
  }

  .active-button {
    background: ${colors.white} !important;
    color: ${colors.dark} !important;
  }

  .inactive-button {
    color: ${colors.white} !important;
    background: ${colors.dark} !important;
    border: 1px solid ${colors.white};
  }
`;

const SideDrawerMobileNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <StyledMobileNav>
      <Nav className="mr-auto mb-2" navbar>
        {navConfig.map((config, i) => (
          <NavItem key={i}>
            <NavLink tag={Link} to={config.url}>
              <Button
                className={`nav-button ${
                  currentPath === config.url ? "active" : "inactive"
                }-button w-100`}
                onClick={() => trackPageEvent(config.eventKey)}
              >
                {config.icon} {config.title}
              </Button>
            </NavLink>
          </NavItem>
        ))}
      </Nav>
    </StyledMobileNav>
  );
};

export default SideDrawerMobileNav;
