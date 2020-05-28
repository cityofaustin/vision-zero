import React from "react";
import { A, usePath } from "hookrouter";

import { Container, Navbar, Button, Nav, NavItem, NavLink } from "reactstrap";
import styled from "styled-components";
import { colors } from "../../constants/colors";

const Footer = () => {
  const currentPath = usePath();
  const isMapView = currentPath === "/map";

  const StyledFooter = styled.div``;

  return (
    <StyledFooter>
      <Container>Footer</Container>
    </StyledFooter>
  );
};

export default Footer;
