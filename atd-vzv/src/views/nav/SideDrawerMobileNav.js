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

  .inactive-nav-button {
    color: ${colors.dark};
    background: ${colors.buttonBackground};
    border-style: none;
    opacity: 1;
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
              {currentPath === config.url ? (
                <Button className="nav-button btn-dark w-100" active>
                  {config.title}
                </Button>
              ) : (
                <Button className="nav-button inactive-nav-button w-100">
                  {config.title}
                </Button>
              )}
            </NavLink>
          </NavItem>
        ))}
      </Nav>
    </StyledMobileNav>
  );
};

export default SideDrawerMobileNav;
