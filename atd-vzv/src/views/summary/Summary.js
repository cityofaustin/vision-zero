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

    .banner {
      background: ${colors.light};
      color: ${colors.dark};
      border-style: none;
    }

    /* Style links for devices that show them as plain text */
    a {
      color: ${colors.infoDark};
      text-decoration: underline;
    }
  `;

  const lastUpdated = moment(dataEndDate).format("MMMM DD, YYYY");

  return (
    <Container fluid>
      <DataModal />
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
      {/* Create whitespace on sides of view until mobile */}
      <Row className="px-xs-0 mx-xs-0 px-lg-3 mx-lg-4 mt-xs-3 mt-lg-4">
        <Col className="px-xs-0">
          <StyledSummary>
            <Row className="summary-child">
              <Alert color="secondary" className="mb-0 banner">
                <div className="mb-2">
                  Austin is consistently ranked as one of America's best places
                  to live, but too many of our fellow Austinites are killed or
                  seriously injured in traffic crashes each year. To learn more
                  about the City's transportation safety initiatives, visit
                  Austin Transportation's Vision Zero Program{" "}
                  <a
                    href="https://austintexas.gov/page/programs-and-initiatives"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    website
                  </a>{" "}
                  and the City's{" "}
                  <a
                    href="https://capitalprojects.austintexas.gov/projects?categoryId=Mobility%2520Infrastructure:&tab=projects"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Capital Projects Explorer
                  </a>{" "}
                  tool.
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
