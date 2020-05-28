import React from "react";
import { A, usePath } from "hookrouter";

import { Container, Row, Col } from "reactstrap";
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

    .link-table {
      padding: 45px 40px 45px 25%;
      color: ${colors.light};
    }
  `;

  // TODO: Breakpoint @ 768px where logo centers w/ circular border overlap, table centers
  // TODO: Breakpoint for footer height increase below 1250px
  // TODO: Table padding: 45px 40px 45px 25%;

  return (
    <StyledFooter>
      <Container fluid className="mt-5">
        <img className="coa-logo float-left" height="100px" src={logo} />
        <Container fluid className="link-table">
          <Row>
            <Col xs="12" md="6" className="p-2">
              Test
            </Col>
            <Col xs="12" md="6" className="p-2">
              Test
            </Col>
            <Col xs="12" md="6" className="p-2">
              Test
            </Col>
            <Col xs="12" md="6" className="p-2">
              Test
            </Col>
            <Col xs="12" md="6" className="p-2">
              Test
            </Col>
            <Col xs="12" md="6" className="p-2">
              Test
            </Col>
            <Col xs="12" md="6" className="p-2">
              Test
            </Col>
            <Col xs="12" md="6" className="p-2">
              Test
            </Col>
          </Row>
        </Container>
      </Container>
    </StyledFooter>
  );
};

export default Footer;
