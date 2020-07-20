import React, { useState } from "react";
import CrashesByYearAverage from "./CrashesByYearAverage";
import { Container, Row, Col, Button } from "reactstrap";
import styled from "styled-components";
import classnames from "classnames";

import CrashTypeSelector from "../nav/CrashTypeSelector";
import InfoPopover from "../../Components/Popover/InfoPopover";
import { colors } from "../../constants/colors";
import { popoverConfig } from "../../Components/Popover/popoverConfig";

const CrashesByYear = () => {
  const [crashType, setCrashType] = useState([]);
  const [activeTab, setActiveTab] = useState("average");

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  // Set styles to override Bootstrap default styling
  const StyledButton = styled.div`
    .chart-toggle-button {
      color: ${colors.dark};
      background: ${colors.buttonBackground} 0% 0% no-repeat padding-box;
      border-style: none;
      opacity: 1;
      margin-left: 5px;
      margin-right: 5px;
    }
  `;

  return (
    <Container className="m-0 p-0">
      <Row>
        <Col>
          <h2 className="text-left font-weight-bold">
            By Year & Month{" "}
            <InfoPopover config={popoverConfig.summary.byYear} />
          </h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <CrashTypeSelector setCrashType={setCrashType} />
        </Col>
      </Row>
      <Row>
        <Col>
          <hr className="mb-2" />
        </Col>
      </Row>
      <Row className="text-center">
        <Col className="pb-2">
          <StyledButton>
            <Button
              className={classnames(
                {
                  active: activeTab === "average",
                },
                "chart-toggle-button"
              )}
              onClick={() => {
                toggle("average");
              }}
            >
              Average
            </Button>
            <Button
              className={classnames(
                { active: activeTab === "cumulative" },
                "chart-toggle-button"
              )}
              onClick={() => {
                toggle("cumulative");
              }}
            >
              Cumulative
            </Button>
          </StyledButton>
        </Col>
      </Row>
      <Row className="mt-1">
        <Col>
          <CrashesByYearAverage crashType={crashType} />
        </Col>
      </Row>
    </Container>
  );
};

export default CrashesByYear;

// -- Query avg fatalities by month over five years
// SELECT date_extract_m(crash_date) as month, sum(death_cnt) / 5 as avg
// WHERE death_cnt > 0 AND crash_date BETWEEN '2015-05-01' and '2020-05-31'
// GROUP BY month
// ORDER BY month

// -- Query sum of fatalities for current year
// SELECT date_extract_m(crash_date) as month, sum(death_cnt) as deathCnt
// WHERE death_cnt > 0 AND crash_date BETWEEN '2020-01-01' and '2020-05-31'
// GROUP BY month
// ORDER BY month
