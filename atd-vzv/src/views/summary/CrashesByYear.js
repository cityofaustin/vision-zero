import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import CrashesByYearCumulative from "./CrashesByYearCumulative";
import CrashesByYearAverage from "./CrashesByYearAverage";
import ChartTypeSelector from "./Components/ChartTypeSelector";
import { Container, Row, Col } from "reactstrap";
import { colors } from "../../constants/colors";

import CrashTypeSelector from "./Components/CrashTypeSelector";
import InfoPopover from "../../Components/Popover/InfoPopover";
import { popoverConfig } from "../../Components/Popover/popoverConfig";
import { crashEndpointUrl } from "./queries/socrataQueries";
import { dataEndDate, dataStartDate } from "../../constants/time";

const CrashesByYear = () => {
  const chartTypes = ["Average", "Cumulative"];

  const [crashType, setCrashType] = useState([]);
  const [chartType, setChartType] = useState("Average");
  const [byYearData, setByYearData] = useState([]);

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

  useEffect(() => {
    const url = `${crashEndpointUrl}?$query=`;

    const byYearDateCondition = `crash_date BETWEEN '${dataStartDate
      .clone()
      .startOf("year")
      .format("YYYY-MM-DD")}' and '${dataEndDate.format("YYYY-MM-DD")}'`;
    const queryGroupAndOrder = `GROUP BY year ORDER BY year`;

    const avgQueries = {
      fatalities: `SELECT date_extract_y(crash_date) as year, sum(death_cnt) as total
                   WHERE death_cnt > 0 AND ${byYearDateCondition} ${queryGroupAndOrder}`,
      fatalitiesAndSeriousInjuries: `SELECT date_extract_y(crash_date) as year, sum(death_cnt) + sum(sus_serious_injry_cnt) as total 
                                     WHERE (death_cnt > 0 OR sus_serious_injry_cnt > 0) AND ${byYearDateCondition} ${queryGroupAndOrder}`,
      seriousInjuries: `SELECT date_extract_y(crash_date) as year, sum(sus_serious_injry_cnt) as total
                        WHERE sus_serious_injry_cnt > 0 AND ${byYearDateCondition} ${queryGroupAndOrder}`,
    };

    axios
      .get(url + encodeURIComponent(avgQueries[crashType.name]))
      .then((res) => {
        setByYearData(res.data);
      });
  }, [crashType]);

  const StyledDiv = styled.div`
    .year-total-div {
      color: ${colors.dark};
      background: ${colors.buttonBackground} 0% 0% no-repeat padding-box;
      border-radius: 4px;
      border-style: none;
      opacity: 1;
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
          <hr />
        </Col>
      </Row>
      <ChartTypeSelector
        chartTypes={chartTypes}
        chartType={chartType}
        setChartType={setChartType}
      />
      <Row className="pb-2">
        <Col xs={4} s={2} m={2} l={2} xl={2}>
          <div>
            <hr
              className="my-1"
              style={{
                border: `4px solid ${colors.buttonBackground}`,
              }}
            ></hr>
            <h3 className="h6 text-center py-1 mb-0">
              <strong>Year</strong>
            </h3>
            <hr className="my-1"></hr>
            <h3 className="h6 text-center py-1">Total</h3>
          </div>
        </Col>
        {byYearData.map((year) => (
          <Col xs={4} s={2} m={2} l={2} xl={2}>
            <StyledDiv>
              <div className="year-total-div">
                <hr
                  className="my-1"
                  style={{
                    border: `4px solid ${colors.light}`,
                  }}
                ></hr>
                <h4 className="h6 text-center py-1 mb-0">
                  <strong>{year.year}</strong>
                </h4>
                <hr className="my-1"></hr>
                <h4 className="h6 text-center py-1">{year.total}</h4>
              </div>
            </StyledDiv>
          </Col>
        ))}
      </Row>

      <Row className="mt-1">
        <Col>{renderChartByType(chartType)}</Col>
      </Row>
    </Container>
  );
};

export default CrashesByYear;
