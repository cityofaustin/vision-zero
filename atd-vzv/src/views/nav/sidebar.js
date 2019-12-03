import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faImage } from "@fortawesome/free-solid-svg-icons";
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
        <p>Dummy Heading</p>
        <NavItem>
          <NavLink>
            <A href="/">
              <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
              Dashboard
            </A>
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink>
            <A href="/map">
              <FontAwesomeIcon icon={faImage} className="mr-2" />
              Map
            </A>
          </NavLink>
        </NavItem>
      </Nav>
    </div>
  </div>
);

export default SideBar;
