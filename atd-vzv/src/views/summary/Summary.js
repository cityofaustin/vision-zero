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
import DataModal from "./DataModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

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
      <DataModal />
      {/* Create whitespace on sides of view until mobile */}
      <Row className="px-xs-0 mx-xs-0 px-lg-3 mx-lg-4 mt-4 mb-0">
        <Col>
          <Alert color="danger">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span className="ml-2">
              This is a beta version of the Vision Zero Viewer, published to
              gather user feedback. Crash data displayed may be outdated or
              inaccurate, and will be updated for the first public release
              version.
            </span>
          </Alert>
        </Col>
      </Row>
      <Row className="px-xs-0 mx-xs-0 px-lg-3 mx-lg-4">
        <Col className="px-xs-0">
          <StyledSummary>
            <Row className="summary-child">
              <Alert
                color="secondary"
                style={{
                  backgroundColor: colors.white,
                  color: colors.dark,
                }}
                className="mb-0"
              >
                <div className="mb-2">
                  Austin is consistently ranked as one of America's best places
                  to live, but too many of our fellow Austinites are killed or
                  seriously injured in traffic crashes each year. To learn more
                  about what the City of Austin is doing to reduce traffic
                  deaths and serious injuries in Austin, visit Austin
                  Transportation's Vision Zero Program website and find updates
                  on all recent bond-funded mobility projects on the City's
                  Capital Projects Explorer tool.
                </div>
                <div>
                  Data through {lastUpdated}. <strong>Crash data</strong>{" "}
                  <InfoPopover config={popoverConfig.map.trafficCrashes} />{" "}
                  includes crashes within City of Austin geographic boundaries,
                  inclusive of all public safety jurisdictions.
                </div>
              </Alert>
            </Row>
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
