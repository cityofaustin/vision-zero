import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faMap } from "@fortawesome/free-solid-svg-icons";
import { NavItem, NavLink, Nav } from "reactstrap";
import classNames from "classnames";
import { A } from "hookrouter";

const SideBar = ({ toggle, isOpen }) => (
  <div className={classNames("sidebar", { "is-open": isOpen })}>
    <div className="sidebar-header">
      <span color="info" onClick={toggle} style={{ color: "#fff" }}>
        &times;
      </span>
      <h3>Vision Zero Viewer</h3>
    </div>
    <div className="side-menu">
      <Nav vertical className="list-unstyled pb-3">
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
    </div>
  </div>
);

export default SideBar;
