import React from "react";
import { A } from "hookrouter";

import { NavItem, NavLink, Nav } from "reactstrap";
import styled from "styled-components";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faMap } from "@fortawesome/free-solid-svg-icons";

const StyledSidebar = styled.div`
  .sidebar {
    min-width: 250px;
    max-width: 250px;
    background: #2f353a;
    color: #fff;
    margin-left: -250px;
    transition: all 0.5s;
  }

  .sidebar.is-open {
    margin-left: 0;
    transition: 0.5s;
  }

  .sidebar-header {
    background: #c8ced3;
  }

  .sidebar-header h3 {
    color: #2f353a;
    padding: 1em;
  }

  .sidebar ul p {
    color: #fff;
    padding: 10px;
  }

  .menu-open {
    background: #6d7fcc;
  }

  .nav-link {
    color: #63c2de;
  }

  .nav-item:hover {
    color: #7386d5;
    background: #fff;
  }

  .items-menu {
    color: #fff;
    background: #6d7fcc;
  }

  li a.dropdown-toggle::after {
    display: inline-flex;
    position: relative;
    left: 60%;
    top: 10%;
  }

  .sidebar-header > span {
    position: relative;
    float: right;
    margin: 0.5em;
    font-size: 2rem;
    cursor: pointer;
    display: none;
  }
  .side-menu {
    height: calc(100vh - 130px);
    overflow-y: scroll;
  }

  .side-menu::-webkit-scrollbar {
    width: 10px;
  }

  .side-menu::-webkit-scrollbar-thumb {
    background: #5466b3;
    border-radius: 3px;
  }

  .side-menu::-webkit-scrollbar-thumb:hover {
    background: #3a4c99;
  }
`;

const SideBar = ({ toggle, isOpen }) => (
  <StyledSidebar>
    {/* Use classNames to toggle "is-name" classname if sidebar isOpen */}
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
  </StyledSidebar>
);

export default SideBar;
