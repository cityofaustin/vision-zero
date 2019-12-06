import React, { useState } from "react";
import { A } from "hookrouter";

import { Navbar, Button, Nav, NavItem, NavLink } from "reactstrap";
import styled from "styled-components";
import { colors } from "../../constants/colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faHome, faMap } from "@fortawesome/free-solid-svg-icons";

const StyledNavbar = styled.div`
  .collapse-toggle {
    @media only screen and (min-width: 600px) {
      display: none;
    }
  }
`;

const Header = ({ toggleSidebar }) => (
  <StyledNavbar>
    <Navbar
      color="light"
      light
      className="navbar shadow-sm p-3 mb-5 bg-white rounded"
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
          <NavLink tag={A} href="/">
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
);

export default Header;
