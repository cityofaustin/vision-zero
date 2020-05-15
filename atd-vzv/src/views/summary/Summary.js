import React from "react";
import CrashesByMonth from "./CrashesByMonth";
import CrashesByTimeOfDay from "./CrashesByTimeOfDay";
import PeopleByDemographics from "./PeopleByDemographics";
import CrashesByMode from "./CrashesByMode";
import SummaryView from "./SummaryView";
import SummaryCard from "./SummaryCard";
import { colors } from "../../constants/colors";
import { dataEndDate } from "../../constants/time";
import InfoPopover from "../../Components/Popover/InfoPopover";
import { popoverConfig } from "../../Components/Popover/popoverConfig";

import { Container, Row, Col, Alert } from "reactstrap";
import styled from "styled-components";
import moment from "moment";

const children = [
  { component: <CrashesByMonth /> },
  { component: <CrashesByMode /> },
  { component: <CrashesByTimeOfDay /> },
  { component: <PeopleByDemographics /> },
];

const Summary = () => {
  const StyledSummary = styled.div`
    /* Set padding for all Summary children in grid that are Bootstrap columns and have .summary-child class */
    .summary-child,
    [class*=".col-"] {
      padding: 0.75em;
    }
  `;

  const lastUpdated = moment(dataEndDate).format("MMMM DD, YYYY");

  return (
    <Container fluid>
      {/* Create whitespace on sides of view until mobile */}
      <Row className="px-xs-0 mx-xs-0 px-lg-3 mx-lg-4 mt-4 mb-0">
        <Col>
          <Alert
            style={{
              backgroundColor: colors.customAlert,
              color: colors.dark,
              borderStyle: "none",
            }}
          >
            This site is a work in progress. The information displayed may be
            outdated or incorrect. Check back later for live Vision Zero data.
          </Alert>
          <Alert
            style={{
              backgroundColor: colors.buttonBackground,
              color: colors.dark,
              borderStyle: "none",
            }}
          >
            Data through {lastUpdated}. <strong>Crash data</strong>{" "}
            <InfoPopover config={popoverConfig.map.trafficCrashes} /> includes
            crashes within City of Austin geographic boundaries, inclusive of
            all public safety jurisdictions.
          </Alert>
        </Col>
      </Row>
      <Row className="px-xs-0 mx-xs-0 px-lg-3 mx-lg-4">
        <Col className="px-xs-0">
          <StyledSummary>
            <SummaryView />
            <Row>
              {children.map((child, i) => (
                <SummaryCard key={i} child={child} />
              ))}
            </Row>
          </StyledSummary>
        </Col>
      </Row>
    </Container>
  );
};

export default Summary;
