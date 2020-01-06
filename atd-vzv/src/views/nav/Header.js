import React, { useState } from "react";
import { StoreContext } from "../../utils/store";
import { A, usePath } from "hookrouter";

import {
  Container,
  Navbar,
  Button,
  Nav,
  NavItem,
  NavLink,
  Collapse,
  NavbarToggler
} from "reactstrap";
import styled from "styled-components";
import { responsive } from "../../constants/responsive";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

const StyledNavbar = styled.div`
  .collapse-toggle {
    @media only screen and (min-width: ${responsive.md}px) {
      display: none;
    }
  }

  .nav-button {
    /* Set width to keep buttons equal width */
    width: 140px;
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
  // Set toggle state for navigation
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggle = () => setIsNavOpen(!isNavOpen);

  // Use context to toggle state for SideDrawer toggle
  const {
    sidebarToggle: [isOpen, setIsOpen]
  } = React.useContext(StoreContext);

  return (
    <Container fluid>
      <StyledNavbar>
        <Navbar
          color="light"
          light
          className="navbar shadow-sm p-3 mb-4 bg-white rounded"
          expand="md"
        >
          <Button
            className="mr-2 collapse-toggle"
            color="info"
            onClick={() => setIsOpen(!isOpen)}
          >
            <FontAwesomeIcon icon={faBars} />
          </Button>
          <NavbarToggler onClick={toggle} />
          <Collapse className="float-right" isOpen={isNavOpen} navbar>
            <Nav className="mr-auto" navbar>
              {navConfig.map((config, i) => (
                <NavItem key={i}>
                  <NavLink tag={A} href={config.url}>
                    {currentPath === config.url ? (
                      <Button className="nav-button">{config.title}</Button>
                    ) : (
                      <Button outline className="nav-button">
                        {config.title}
                      </Button>
                    )}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
          </Collapse>
        </Navbar>
      </StyledNavbar>
    </Container>
  );
};

export default Header;
