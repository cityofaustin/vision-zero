import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import moment from "moment";
import { Line } from "react-chartjs-2";
import { Container, Row, Col } from "reactstrap";
import styled from "styled-components";

import { crashEndpointUrl } from "./queries/socrataQueries";
import {
  dataEndDate,
  summaryCurrentYearEndDate,
  yearsArray,
} from "../../constants/time";
import { colors } from "../../constants/colors";

const CrashesByYearAverage = ({ crashType }) => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    const queries = {
      fatalities: `SELECT date_extract_m(crash_date) as month, sum(death_cnt) / 5 as avg
WHERE death_cnt > 0 AND crash_date BETWEEN '2015-05-01' and '2020-05-31'
GROUP BY month
ORDER BY month`,
      fatalitiesAndSeriousInjuries: ``,

      seriousInjuries: ``,
    };

    const url = `${crashEndpointUrl}$query=`;

    axios.get(url + queries["fatalities"]).then((res) => {
      setChartData(res.data);
    });
  }, [crashType]);

  return <>{JSON.stringify(chartData)}</>;
};

export default CrashesByYearAverage;
