import React from "react";
import { A, usePath } from "hookrouter";
import { Button, Nav, NavItem, NavLink } from "reactstrap";
import { navConfig } from "../../constants/nav";
import { responsive } from "../../constants/responsive";
import { colors } from "../../constants/colors";
import styled from "styled-components";

const StyledMobileNav = styled.div`
  @media only screen and (min-width: ${responsive.bootstrapMediumMin}px) {
    display: none;
  }

  .nav-button {
    /* Set width to keep buttons equal width */
    width: 140px;
    height: 56px;
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
  const currentPath = usePath();

  return (
    <StyledMobileNav>
      <Nav className="mr-auto" navbar>
        {navConfig.map((config, i) => (
          <NavItem key={i}>
            <NavLink tag={A} href={config.url}>
              <Button
                className={`nav-button ${
                  currentPath === config.url ? "active" : "inactive"
                }-button w-100`}
              >
                {config.title}
              </Button>
            </NavLink>
          </NavItem>
        ))}
      </Nav>
    </StyledMobileNav>
  );
};

export default SideDrawerMobileNav;
