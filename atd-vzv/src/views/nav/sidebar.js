import React from "react";
import { A } from "hookrouter";

import { NavItem, NavLink, Nav } from "reactstrap";
import styled from "styled-components";
import classNames from "classnames";
import { colors } from "../../constants/colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faMap } from "@fortawesome/free-solid-svg-icons";

const StyledSidebar = styled.div`
  .sidebar {
    min-width: 250px;
    max-width: 250px;
    background: ${colors.dark};
    color: ${colors.light};
    margin-left: -250px;
    transition: all 0.5s;
  }

  .sidebar.is-open {
    margin-left: 0;
    transition: 0.5s;
  }

  .sidebar-header {
    background: ${colors.light};
  }

  .sidebar-header h3 {
    color: ${colors.dark};
    padding: 1em;
  }

  .sidebar ul p {
    color: ${colors.light};
    padding: 10px;
  }

  .menu-open {
    background: ${colors.info};
  }

  .nav-link {
    color: ${colors.info};
  }

  .nav-item:hover {
    color: ${colors.primary};
    background: ${colors.light};
  }

  .items-menu {
    color: ${colors.light};
    background: ${colors.info};
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
    background: ${colors.primary};
    border-radius: 3px;
  }

  .side-menu::-webkit-scrollbar-thumb:hover {
    background: ${colors.primary};
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
