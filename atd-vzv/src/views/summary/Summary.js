import React from "react";
import FatalitiesByMode from "./FatalitiesByMode";
import FatalitiesMultiYear from "./FatalitiesMultiYear";
import FatalitiesByTimeOfDay from "./FatalitiesByTimeOfDay";
import DemographicsByYear from "./DemographicsByYear";
import SummaryView from "./SummaryView";
import SummaryCard from "./SummaryCard";

import { Container, Row } from "reactstrap";
import styled from "styled-components";

const children = [
  { component: <FatalitiesMultiYear /> },
  { component: <FatalitiesByMode /> },
  { component: <FatalitiesByTimeOfDay /> },
  { component: <DemographicsByYear /> }
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
