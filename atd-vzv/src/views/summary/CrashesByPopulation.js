import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col } from "reactstrap";

import CrashTypeSelector from "./Components/CrashTypeSelector";
import InfoPopover from "../../Components/Popover/InfoPopover";
import { popoverConfig } from "../../Components/Popover/popoverConfig";
import { crashEndpointUrl } from "./queries/socrataQueries";
import {
  fiveYearAvgStartDate,
  fiveYearAvgEndDate,
  summaryCurrentYearEndDate,
  summaryCurrentYearStartDate,
} from "../../constants/time";

const CrashesByPopulation = () => {
  const [crashType, setCrashType] = useState(null);

  const [avgData, setAvgData] = useState([]);

  const url = `${crashEndpointUrl}?$query=`;

  // Fetch data for By Month Average and Cumulative visualizations
  useEffect(() => {
    const avgDateCondition = `crash_date BETWEEN '${fiveYearAvgStartDate}' and '${fiveYearAvgEndDate}'`;
    const currentYearDateCondition = `crash_date BETWEEN '${summaryCurrentYearStartDate}' and '${summaryCurrentYearEndDate}'`;
    const queryGroupAndOrder = `GROUP BY month ORDER BY month`;

    const avgQueries = {
      fatalities: `SELECT date_extract_y(crash_date) as month, sum(death_cnt) / 5 as avg 
                   WHERE death_cnt > 0 AND ${avgDateCondition} ${queryGroupAndOrder}`,
      fatalitiesAndSeriousInjuries: `SELECT date_extract_y(crash_date) as month, sum(death_cnt) / 5 + sum(sus_serious_injry_cnt) / 5 as avg 
                                     WHERE (death_cnt > 0 OR sus_serious_injry_cnt > 0) AND ${avgDateCondition} ${queryGroupAndOrder}`,
      seriousInjuries: `SELECT date_extract_y(crash_date) as month, sum(sus_serious_injry_cnt) / 5 as avg 
                        WHERE sus_serious_injry_cnt > 0 AND ${avgDateCondition} ${queryGroupAndOrder}`,
    };

    !!crashType &&
      axios
        .get(url + encodeURIComponent(avgQueries[crashType.name]))
        .then((res) => {
          setAvgData(res.data);
        });
  }, [crashType, url]);

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
      <Row className="mt-1">
        <Col>Chart</Col>
      </Row>
    </Container>
  );
};

export default CrashesByPopulation;
