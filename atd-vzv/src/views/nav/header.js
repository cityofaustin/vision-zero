import React, { useState } from "react";
import { A } from "hookrouter";

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
  { title: "Map", url: "/map" },
  { title: "Engineering", url: "/engineering" },
  { title: "Enforcement", url: "/enforcement" },
  { title: "Education", url: "/education" }
];

const Header = ({ toggleSidebar }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

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
            onClick={toggleSidebar}
          >
            <FontAwesomeIcon icon={faBars} />
          </Button>
          <NavbarToggler onClick={toggle} />
          <Collapse isOpen={isOpen} navbar>
            <Nav className="mr-auto" navbar>
              {navConfig.map((config, i) => (
                <NavItem key={i}>
                  <NavLink tag={A} href={config.url}>
                    <Button className="nav-button">{config.title}</Button>
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
