import React from "react";
import { A } from "hookrouter";

import { Container, Navbar, Button, Nav, NavItem, NavLink } from "reactstrap";
import styled from "styled-components";
import { responsive } from "../../constants/responsive";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faHome, faMap } from "@fortawesome/free-solid-svg-icons";

const StyledNavbar = styled.div`
  .collapse-toggle {
    @media only screen and (min-width: ${responsive.md}px) {
      display: none;
    }
  }
`;

const Header = ({ toggleSidebar }) => (
  <Container fluid className="bg-light">
    <StyledNavbar>
      <Navbar
        color="light"
        light
        className="navbar shadow-sm p-3 mb-4 bg-white rounded"
        expand="xs"
      >
        <Button
          className="mr-2 collapse-toggle"
          color="info"
          onClick={toggleSidebar}
        >
          <FontAwesomeIcon icon={faBars} />
        </Button>

        <Nav className="mr-auto" navbar>
          <NavItem>
            <NavLink tag={A} href="/charts">
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
      </Navbar>
    </StyledNavbar>
  </Container>
);

export default Header;
