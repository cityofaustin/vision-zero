import React from "react";
import Footer from "../nav/Footer";

import { Container, Row, Navbar, Alert } from "reactstrap";
import { responsive } from "../../constants/responsive";

const UnderMaintenance = () => {
  return (
    <div style={{ width: "100%" }}>
      <header role="banner">
        <Navbar
          light
          className="navbar shadow-sm static-top header-navbar px-0"
          expand="md"
          style={{ height: `${responsive.headerHeight}px` }}
        >
          <Container fluid className={"px-0"}>
            <div className="vz-logo-wrapper">
              <h1 className="sr-only">
                Vision Zero -- Help Austin reach zero traffic deaths
              </h1>
              <img
                className="vz-logo"
                style={{ height: "40px" }}
                src={process.env.PUBLIC_URL + "/vz_logo.png"}
                alt="Vision Zero Austin Logo"
              ></img>
            </div>
          </Container>
        </Navbar>
      </header>

      <Container style={{ height: "40vh" }}>
        <Row className="my-5 mx-auto">
          <Alert color="info" className="col-8 mb-0">
            <div className="my-2">
              This site is currently under maintenance - please check back soon.
            </div>
          </Alert>
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

export default UnderMaintenance;
