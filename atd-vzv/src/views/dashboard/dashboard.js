import React from "react";
import Fatalities from "./Fatalities";
import FatalitiesByMode from "./fatalitiesByMode";
import SeriousInjuries from "./seriousInjuries";
import SeriousInjuryAndFatalCrashesByMonth from "./seriousInjuryAndFatalCrashesByMonth";
import SeriousInjuryAndFatalCrashesByMode from "./seriousInjuryAndFatalCrashesByMode";
import YearsOfLifeLost from "./yearsOfLifeLost";
import FatalitiesMultiYear from "./FatalitiesMultiYear";
import SummaryView from "./SummaryView";
import SummaryCard from "./SummaryCard";

import { Container, Row, Col } from "reactstrap";

const subComponents = [
  <Fatalities />,
  <FatalitiesByMode />,
  <SeriousInjuries />,
  <SeriousInjuryAndFatalCrashesByMonth />,
  <SeriousInjuryAndFatalCrashesByMode />,
  <YearsOfLifeLost />,
  <FatalitiesMultiYear />
];

const Dashboard = () => {
  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <SummaryView />
        </Col>
      </Row>
      <Row>
        {subComponents.map(subComponent => (
          <SummaryCard subComponent={subComponent} />
        ))}
      </Row>
    </Container>
  );
};

export default Dashboard;
