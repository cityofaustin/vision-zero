import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Nav, NavItem, NavLink } from "reactstrap";
import { navConfig, trackPageEvent } from "../../constants/nav";
import { responsive } from "../../constants/responsive";
import { colors } from "../../constants/colors";
import { StoreContext } from "../../constants/context";
import styled from "styled-components";

const StyledMobileNav = styled.div`
  @media only screen and (min-width: ${responsive.bootstrapMediumMin}px) {
    display: none;
  }

  .nav-button {
    height: ${responsive.headerButtonHeight}px;
    font-size: 18px;
    color: ${colors.white};
    background: ${colors.infoDark};
  }

`;

const SideDrawerMobileNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const {
    sidebarToggle: [, setIsOpen],
  } = useContext(StoreContext);

  return (
    <StyledMobileNav>
      <Nav className="me-auto mb-2" navbar>
        {navConfig.map(
          (config, i) =>
            currentPath !== config.url && (
              <NavItem key={i}>
                <NavLink tag={Link} to={config.url}>
                  <Button
                    className={`nav-button w-100`}
                    onClick={() => {
                      trackPageEvent(config.eventKey);
                      setIsOpen(false);
                    }}
                  >
                    {config.icon} {config.title}
                  </Button>
                </NavLink>
              </NavItem>
            ),
        )}
      </Nav>
    </StyledMobileNav>
  );
};

export default SideDrawerMobileNav;
