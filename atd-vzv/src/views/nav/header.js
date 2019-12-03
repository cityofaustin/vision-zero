import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import {
  Navbar,
  Button,
  NavbarToggler,
  Collapse,
  Nav,
  NavItem,
  NavLink
} from "reactstrap";
import { A } from "hookrouter";

const Header = ({ toggleSidebar }) => {
  const [isOpen, setOpen] = useState(true);
  const toggle = () => setOpen(!isOpen);

  return (
    <Navbar
      color="light"
      light
      className="navbar shadow-sm p-3 mb-5 bg-white rounded"
      expand="md"
    >
      <Button color="info" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={faBars} />
      </Button>
      <NavbarToggler onClick={toggle} />
      <Collapse isOpen={isOpen} navbar>
        <Nav className="ml-auto" navbar>
          <NavLink>
            <NavItem>
              <A href="/">Home</A>
            </NavItem>
          </NavLink>
          <NavLink>
            <NavItem>
              <A href="/map">Map</A>
            </NavItem>
          </NavLink>
        </Nav>
      </Collapse>
    </Navbar>
  );
};

export default Header;
