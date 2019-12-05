import React, { useState } from "react";
import { A } from "hookrouter";

import { NavItem, NavLink, Nav, ButtonGroup, Button } from "reactstrap";
import styled from "styled-components";
import classNames from "classnames";
import { sidebar } from "../../constants/sidebar";
import { colors } from "../../constants/colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faMap } from "@fortawesome/free-solid-svg-icons";

const StyledSidebar = styled.div`
  .sidebar {
    min-width: ${sidebar.width};
    max-width: ${sidebar.width};
    background: ${colors.dark};
    color: ${colors.light};
    margin-left: -${sidebar.width};
    transition: all 0.5s;
    height: 100vh;
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

  .sidebar-header > span {
    position: relative;
    float: right;

    font-size: 2rem;
    cursor: pointer;
    display: none;
  }

  .side-menu {
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

const queryParameters = {
  pedestrian: {
    syntax: `$where=pedestrian_fl = "Y"`
  }
};

const SideBar = ({ toggle, isOpen }) => {
  const [mapSettings, setMapSettings] = useState([]);

  const handleSettingsClick = event => {};

  return (
    <StyledSidebar>
      {/* Use classNames to toggle "is-name" classname if sidebar isOpen */}
      <div className={classNames("sidebar", { "is-open": isOpen })}>
        <div className="side-menu">
          <div className="sidebar-header">
            <span color="info" onClick={toggle} style={{ color: "#fff" }}>
              &times;
            </span>
            <h3>Vision Zero Viewer</h3>
          </div>
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
      <ButtonGroup>
        <Button
          color="info"
          onClick={handleSettingsClick}
          id="pedestrian"
          active={mapSettings.includes("pedestrian")}
        >
          Pedestrian
        </Button>
      </ButtonGroup>
    </StyledSidebar>
  );
};

export default SideBar;
