import React from "react";
import Footer from "../nav/Footer";

import { Container, Row, Navbar, Alert } from "reactstrap";
import { responsive } from "../../constants/responsive";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

// isMeasuresPath is true when the route is '/measures', the view that is serves the widgets on the austintexas.gov drupal site
// that view should not show the header nor footer, since its an embed in another page
const UnderMaintenance = ({ isMeasuresPath }) => {
  return (
    <div style={{ width: "100%" }}>
      {!isMeasuresPath && (
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
      )}

      <Container style={{ height: "40vh" }}>
        <Row className="my-5 mx-auto">
          <Alert color="info" className="mb-0">
            <div className="my-2">
              <FontAwesomeIcon
                icon={faInfoCircle}
                style={{ marginRight: "1rem" }}
              />
              {isMeasuresPath
                ? "Vision Zero metrics are currently under maintenance. "
                : "The Vision Zero Viewer is undergoing maintenance and will be unavailable until September 3, 2024"}
            </div>
          </Alert>
        </Row>
      </Container>
      {!isMeasuresPath && <Footer />}
    </div>
  );
};

export default UnderMaintenance;
