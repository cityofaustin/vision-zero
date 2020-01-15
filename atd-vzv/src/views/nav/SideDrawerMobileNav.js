import React from "react";
import { A, usePath } from "hookrouter";
import { Button, Nav, NavItem, NavLink } from "reactstrap";

const navConfig = [
  {
    title: "Summary",
    url: "/summary"
  },
  { title: "Map", url: "/map" }
];

const SideDrawerMobileNav = () => {
  const currentPath = usePath();

  return (
    <Nav className="mr-auto" navbar>
      {navConfig.map((config, i) => (
        <NavItem key={i}>
          <NavLink tag={A} href={config.url}>
            {currentPath === config.url ? (
              <Button className="nav-button btn-light">{config.title}</Button>
            ) : (
              <Button outline className="nav-button btn-outline-light">
                {config.title}
              </Button>
            )}
          </NavLink>
        </NavItem>
      ))}
    </Nav>
  );
};

export default SideDrawerMobileNav;
