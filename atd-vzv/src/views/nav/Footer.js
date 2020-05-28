import React from "react";
import { A, usePath } from "hookrouter";

import { Container, Navbar, Button, Nav, NavItem, NavLink } from "reactstrap";
import styled from "styled-components";
import { colors } from "../../constants/colors";
import logo from "./coa_seal_transparent_white.png";

const Footer = () => {
  const currentPath = usePath();

  const StyledFooter = styled.div`
    height: 280px;
    background: ${colors.dark};
    color: ${colors.light};

    .coa-logo {
      position: relative;
      left: 93px;
      top: 45px;
    }
  `;

  // TODO: Breakpoint @ 768px where logo centers w/ circular border overlap, table centers
  // TODO: Table padding: 45px 40px 45px 25%;

  return (
    <StyledFooter>
      <Container fluid className="mt-4">
        <img className="coa-logo" height="100px" src={logo} />
        Footer
      </Container>
    </StyledFooter>
  );
};

export default Footer;
