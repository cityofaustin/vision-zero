import React from "react";
import Fatalities from "./fatalities";
import SeriousInjuries from "./seriousInjuries";
import SeriousInjuryAndFatalCrashesByMonth from "./seriousInjuryAndFatalCrashesByMonth";
import SeriousInjuryAndFatalCrashesByMode from "./seriousInjuryAndFatalCrashesByMode";

import { Container, Row, Col } from "reactstrap";

const Dashboard = () => {
  return (
    <Container>
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
    </Container>
  );
};

export default Dashboard;
