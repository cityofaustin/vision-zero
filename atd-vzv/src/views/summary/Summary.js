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

import { Container, Row } from "reactstrap";
import styled from "styled-components";

const children = [
  <Fatalities />,
  <FatalitiesByMode />,
  <SeriousInjuries />,
  <SeriousInjuryAndFatalCrashesByMonth />,
  <SeriousInjuryAndFatalCrashesByMode />,
  <YearsOfLifeLost />,
  <FatalitiesMultiYear />
];

const Summary = () => {
  const StyledSummary = styled.div`
    /* Set padding for all Summary children in grid */
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
