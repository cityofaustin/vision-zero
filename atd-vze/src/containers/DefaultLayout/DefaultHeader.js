import React, { useContext } from "react";
import { NavLink, Link } from "react-router-dom";
import { Auth0Context } from "../../auth/authContextStore";
import {
  UncontrolledDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  NavItem,
} from "reactstrap";
import PropTypes from "prop-types";

import { AppNavbarBrand, AppSidebarToggler } from "@coreui/react";
import logo from "../../assets/img/brand/visionzerotext.png";

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

const DefaultHeader = props => {
  const { logout } = useContext(Auth0Context);
  // eslint-disable-next-line
  const { children, ...attributes } = props;

  return (
    <React.Fragment>
      <AppSidebarToggler className="d-lg-none" display="md" mobile />
      <AppNavbarBrand
        full={{
          src: logo,
          width: 140,
          height: 25,
          alt: "Vision Zero Austin",
        }}
      />
      <AppSidebarToggler className="d-md-down-none" display="lg" />

      <Nav className="d-md-down-none" navbar>
        <NavItem className="px-3">
          <NavLink to="/dashboard" className="nav-link">
            Dashboard
          </NavLink>
        </NavItem>
        <NavItem className="px-3">
          <NavLink to="/users" className="nav-link">
            Users
          </NavLink>
        </NavItem>
      </Nav>
      <Nav className="ml-auto" navbar>
        <UncontrolledDropdown nav direction="down">
          <DropdownToggle nav>
            <img
              src={"./assets/img/avatars/1.png"}
              className="img-avatar"
              alt="admin@bootstrapmaster.com"
            />
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem header tag="div" className="text-center">
              <strong>Account</strong>
            </DropdownItem>
            <DropdownItem>
              <Link
                to="/profile"
                style={{ color: "inherit", textDecoration: "inherit" }}
              >
                <i className="fa fa-user" /> Profile
              </Link>
            </DropdownItem>
            <DropdownItem onClick={logout}>
              <i className="fa fa-lock" /> Log Out
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </Nav>
    </React.Fragment>
  );
};

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;
