import React from "react";
import { StoreContext } from "../../utils/store";
import { A } from "hookrouter";

import { Container, Navbar, Button, Nav, NavItem, NavLink } from "reactstrap";
import styled from "styled-components";
import { responsive } from "../../constants/responsive";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faHome, faMap } from "@fortawesome/free-solid-svg-icons";

const StyledNavbar = styled.div`
  .collapse-toggle {
    /* Hide toggle until mobile */
    @media only screen and (min-width: ${responsive.sm}px) {
      display: none;
    }
  }
`;

const Header = () => {
  const {
    sidebarToggle: [isOpen, setIsOpen]
  } = React.useContext(StoreContext);

  return (
    <Container fluid className="bg-light">
      <StyledNavbar>
        <Navbar
          color="light"
          light
          className="navbar shadow-sm p-3 mb-4 mt-4 bg-white rounded"
          expand="xs"
        >
          <Button
            className="mr-2 collapse-toggle"
            color="info"
            onClick={() => setIsOpen(!isOpen)}
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
    </Container>
  );
};

export default Header;
