import React, { Component } from "react";
import Fatalities from "./fatalities";
import SeriousInjuries from "./seriousInjuries";
import SeriousInjuryAndFatalCrashesByMonth from "./seriousInjuryAndFatalCrashesByMonth";
import SeriousInjuryAndFatalCrashesByMode from "./seriousInjuryAndFatalCrashesByMode";
import YearsOfLifeLost from "./yearsOfLifeLost";
import ScrapdMap from "./scrapd-map/component"
import { Container, Row, Col, Alert } from "reactstrap";

// For debugging purpose only.
// Import this object instead of fetching it over the network.
// import { fatalities } from "./scrapd-map/crash"


class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fatalities: [],
    };
  }

  componentDidMount() {
    fetch('https://data.austintexas.gov/resource/y2wy-tgr5.json')
      .then(response => response.json())
      .then(fatalities => this.setState({ fatalities }));
  }

  render() {
    return (
      <Container fluid>
        <Row>
          <Col md="12">
            <Alert color="primary">
              <h4 className="alert-heading">This site is a work in progress.</h4>
              <p>
                The information displayed below may be outdated or incorrent.
              <br></br>
                Check back later for live Vision Zero data.
            </p>
            </Alert>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Fatalities />
          </Col>
          <Col md="6">
            <SeriousInjuryAndFatalCrashesByMonth />
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <SeriousInjuries />
          </Col>
          {/* TODO Serious Injury + Fatal Crashes by Mode - populate real data */}
          <Col md="6">
            <SeriousInjuryAndFatalCrashesByMode />
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <YearsOfLifeLost />
          </Col>
          <Col md="6"></Col>
        </Row>
        <Row>
          <Col md="12">
            <h2>Cluster Map</h2>
            <ScrapdMap fatalities={this.state.fatalities} />
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Dashboard;
