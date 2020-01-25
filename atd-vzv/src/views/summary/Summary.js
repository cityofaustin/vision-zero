import React from "react";
import Fatalities from "./Fatalities";
import FatalitiesByMode from "./FatalitiesByMode";
import SeriousInjuries from "./SeriousInjuries";
import SeriousInjuryAndFatalCrashesByMonth from "./SeriousInjuryAndFatalCrashesByMonth";
import SeriousInjuryAndFatalCrashesByMode from "./SeriousInjuryAndFatalCrashesByMode";
import FatalitiesMultiYear from "./FatalitiesMultiYear";
import FatalitiesByTimeOfDay from "./FatalitiesByTimeOfDay";
import SummaryView from "./SummaryView";
import SummaryCard from "./SummaryCard";

import { Container, Row } from "reactstrap";
import styled from "styled-components";

const children = [
  { component: <Fatalities />, title: "Year-to-Date Fatalities" },
  { component: <FatalitiesByMode />, title: "Fatalities by Mode" },
  { component: <SeriousInjuries />, title: "Year-to-Date Serious Injuries" },
  {
    component: <SeriousInjuryAndFatalCrashesByMonth />,
    title: "Serious Injury and Fatal Crashes by Month"
  },
  {
    component: <SeriousInjuryAndFatalCrashesByMode />,
    title: "Serious Injury and Fatal Crashes by Mode"
  },
  { component: <FatalitiesMultiYear />, title: "Traffic Fatalities by Year" },
  {
    component: <FatalitiesByTimeOfDay />,
    title: "Traffic Fatalities by Time of Day"
  }
];

const Summary = () => {
  const StyledSummary = styled.div`
    /* Set padding for all Summary children in grid that are Bootstrap columns and have .summary-child class */
    .summary-child,
    [class*=".col-"] {
      padding: 0.75em;
    }
  `;

  return (
    <Container fluid>
      <StyledSummary>
        <SummaryView />
        <Row>
          {children.map((child, i) => (
            <SummaryCard key={i} child={child} />
          ))}
        </Row>
      </StyledSummary>
    </Container>
  );
};

export default Summary;
