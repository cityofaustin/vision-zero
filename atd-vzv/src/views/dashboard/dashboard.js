import React from "react";
import Fatalities from "./Fatalities";
import FatalitiesByMode from "./FatalitiesByMode";
import SeriousInjuries from "./SeriousInjuries";
import SeriousInjuryAndFatalCrashesByMonth from "./SeriousInjuryAndFatalCrashesByMonth";
import SeriousInjuryAndFatalCrashesByMode from "./SeriousInjuryAndFatalCrashesByMode";
import YearsOfLifeLost from "./YearsOfLifeLost";
import FatalitiesMultiYear from "./FatalitiesMultiYear";
import SummaryView from "./SummaryView";
import SummaryCard from "./SummaryCard";

import { Container, Row, Col } from "reactstrap";

const children = [
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
        {children.map((child, i) => (
          <SummaryCard key={i} child={child} />
        ))}
      </Row>
    </Container>
  );
};

export default Dashboard;
