import React from "react";
import Fatalities from "./Fatalities";
import SeriousInjuries from "./SeriousInjuries";
import SeriousInjuryAndFatalCrashesByMonth from "./SeriousInjuryAndFatalCrashesByMonth";
import SeriousInjuryAndFatalCrashesByMode from "./SeriousInjuryAndFatalCrashesByMode";
import FatalitiesMultiYear from "./FatalitiesMultiYear";
import FatalitiesByTimeOfDayWeek from "./FatalitiesByTimeOfDayWeek";

import { Container, Row, Col } from "reactstrap";

const Dashboard = () => {
  return (
    <Container fluid>
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
          <FatalitiesMultiYear />
        </Col>
        <Col md="6">
          <FatalitiesByTimeOfDayWeek />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
