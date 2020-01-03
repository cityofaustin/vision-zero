import React from "react";
import Fatalities from "./Fatalities";
import FatalitiesByMode from "./fatalitiesByMode";
import SeriousInjuries from "./seriousInjuries";
import SeriousInjuryAndFatalCrashesByMonth from "./seriousInjuryAndFatalCrashesByMonth";
import SeriousInjuryAndFatalCrashesByMode from "./seriousInjuryAndFatalCrashesByMode";
import YearsOfLifeLost from "./yearsOfLifeLost";
import FatalitiesMultiYear from "./FatalitiesMultiYear";
import SummaryView from "./SummaryView";

import { Container, Row, Col } from "reactstrap";

const Dashboard = () => {
  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <SummaryView />
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
        <Col md="6">
          <FatalitiesMultiYear />
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <FatalitiesByMode />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
