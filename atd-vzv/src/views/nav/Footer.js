import React from "react";

import { Container, Row, Col } from "reactstrap";
import styled from "styled-components";
import { colors } from "../../constants/colors";
import logo from "./coa_seal_transparent_white.png";

let pckg = require("../../../package.json");

const Footer = () => {
  const StyledFooter = styled.div`
    height: 280px;
    background: ${colors.dark};
    color: ${colors.light};
    font-weight: bold;

    .coa-logo {
      position: relative;
      left: 100px;
      top: 45px;
    }

    .link-table {
      position: absolute;
      left: 0px;
      padding: 45px 40px 45px 25%;
      color: ${colors.light};
      font-size: 16px;
      width: 100%;
    }

    .link-title {
      font-size: 20px;
      padding: 10px 15px 10px 15px;
    }

    .link {
      padding: 10px 15px 10px 15px;
    }

    .version {
      position: absolute;
      right: 0px;
      bottom: 0px;
    }

    a,
    a:hover {
      color: ${colors.light};
    }

    @media only screen and (max-width: 990px) {
      height: 334px;

      .coa-logo {
        position: relative;
        left: 40px;
        top: 45px;
      }
    }

    @media only screen and (max-width: 768px) {
      height: 450px;
      text-align: center;

      .link-table {
        padding: 80px 0px 0px 0px;
        margin: 0px auto;
      }

      .coa-logo {
        position: relative;
        background: ${colors.dark};
        top: -20px;
        border: 10px solid ${colors.dark};
        border-radius: 50%;
        left: 50%;
        transform: translate(-50%, 0%);
      }
    }
  `;

  // TODO: Breakpoint @ 768px where logo centers w/ circular border overlap, table centers
  // TODO: Breakpoint for footer height increase below 1250px

  return (
    <StyledFooter>
      <Container fluid className="mt-5">
        <img className="coa-logo float-left" height="100px" src={logo} />
        <Row className="link-table">
          <Col xs="12" className="link-title">
            City of Austin Transportation Department
          </Col>
          <Col xs="12" md="6" className="link">
            <a href="https://data.austintexas.gov/Transportation-and-Mobility/-UNDER-CONSTRUCTION-Crash-Report-Data/y2wy-tgr5/data">
              Data
            </a>
          </Col>
          <Col xs="12" md="6" className="link">
            <a href="https://github.com/cityofaustin/atd-vz-data/tree/master/atd-vzv">
              Code
            </a>
          </Col>
          <Col xs="12" md="6" className="link">
            <a href="https://austintexas.gov/page/city-austin-open-data-terms-use">
              Disclaimer
            </a>
          </Col>
          <Col xs="12" md="6" className="link">
            <a href="https://www.austintexas.gov/page/privacy-policy">
              Privacy
            </a>
          </Col>
          <Col xs="12" md="6" className="link">
            <a href="mailto:transportation.data@austintexas.gov">
              Give feedback on Vision Zero Viewer
            </a>
          </Col>
          <Col xs="12" md="6" className="link">
            Powered by Data & Technology Services
          </Col>
        </Row>
        <div className="version">v{pckg.version}</div>
      </Container>
    </StyledFooter>
  );
};

export default Footer;
