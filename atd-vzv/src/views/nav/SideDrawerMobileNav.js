import React from "react";
import { A, usePath } from "hookrouter";
import { Button, Nav, NavItem, NavLink } from "reactstrap";
import { responsive } from "../../constants/responsive";
import styled from "styled-components";

const navConfig = [
  {
    title: "Summary",
    url: "/summary"
  },
  { title: "Map", url: "/map" }
];

const StyledMobileNav = styled.div`
  @media only screen and (min-width: ${responsive.bootstrapMediumMin}px) {
    display: none;
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
                <Button className="nav-button btn-light w-100">
                  {config.title}
                </Button>
              ) : (
                <Button outline className="nav-button btn-outline-light w-100">
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
