import React from "react";
import Footer from "../nav/Footer";

import { Container, Row, Navbar } from "reactstrap";
import { responsive } from "../../constants/responsive";

const UnderMaintenance = () => {
  return (
    <div>
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

      <Container style={{ width: "100vw" }}>
        <Row className="my-5 mx-5">
          <h3>Sorry, but this page does not exist.</h3>
        </Row>
      </Container>
      <Footer />
    </div>
  );
};

export default UnderMaintenance;
