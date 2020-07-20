import React, { useState } from "react";
import CrashesByYearCumulative from "./CrashesByYearCumulative";
import CrashesByYearAverage from "./CrashesByYearAverage";
import ChartTypeSelector from "./Components/ChartTypeSelector";
import { Container, Row, Col } from "reactstrap";

import CrashTypeSelector from "./Components/CrashTypeSelector";
import InfoPopover from "../../Components/Popover/InfoPopover";
import { popoverConfig } from "../../Components/Popover/popoverConfig";

const CrashesByYear = () => {
  const chartTypes = ["Average", "Cumulative"];

  const [crashType, setCrashType] = useState([]);
  const [chartType, setChartType] = useState("Average");

  const renderChartByType = (chartType) => {
    switch (chartType) {
      case "Average":
        return <CrashesByYearAverage crashType={crashType} />;
      case "Cumulative":
        return <CrashesByYearCumulative crashType={crashType} />;
      default:
        return "No chart selected";
    }
  };

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
      <ChartTypeSelector
        chartTypes={chartTypes}
        chartType={chartType}
        setChartType={setChartType}
      />
      <Row className="mt-1">
        <Col>{renderChartByType(chartType)}</Col>
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
