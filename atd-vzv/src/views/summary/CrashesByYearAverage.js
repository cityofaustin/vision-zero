import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import moment from "moment";
import { Bar } from "react-chartjs-2";
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
  const [avgData, setAvgData] = useState([]);
  const [currentYearData, setCurrentYearData] = useState([]);

  useEffect(() => {
    const avgQueries = {
      fatalities: `SELECT date_extract_m(crash_date) as month, sum(death_cnt) / 5 as avg WHERE death_cnt > 0 AND crash_date BETWEEN '2015-05-01' and '2020-05-31' GROUP BY month ORDER BY month`,
      fatalitiesAndSeriousInjuries: `SELECT date_extract_m(crash_date) as month, sum(death_cnt) / 5 + sum(sus_serious_injry_cnt) / 5 as avg WHERE (death_cnt > 0 OR sus_serious_injry_cnt > 0) AND crash_date BETWEEN '2015-05-01' and '2020-05-31' GROUP BY month ORDER BY month`,
      seriousInjuries: `SELECT date_extract_m(crash_date) as month, sum(sus_serious_injry_cnt) / 5 as avg WHERE sus_serious_injry_cnt > 0 AND crash_date BETWEEN '2015-05-01' and '2020-05-31' GROUP BY month ORDER BY month`,
    };

    const currentYearQueries = {
      fatalities: `SELECT date_extract_m(crash_date) as month, sum(death_cnt) as total WHERE death_cnt > 0 AND crash_date BETWEEN '2020-01-01' and '2020-05-31' GROUP BY month ORDER BY month`,
      fatalitiesAndSeriousInjuries: `SELECT date_extract_m(crash_date) as month, sum(death_cnt) + sum(sus_serious_injry_cnt) as total WHERE (death_cnt > 0 OR sus_serious_injry_cnt > 0) AND crash_date BETWEEN '2020-01-01' and '2020-05-31' GROUP BY month ORDER BY month`,
      seriousInjuries: `SELECT date_extract_m(crash_date) as month, sum(sus_serious_injry_cnt) as total WHERE sus_serious_injry_cnt > 0 AND crash_date BETWEEN '2020-01-01' and '2020-05-31' GROUP BY month ORDER BY month`,
    };

    const url = `${crashEndpointUrl}?$query=`;

    axios
      .get(url + encodeURIComponent(avgQueries[crashType.name]))
      .then((res) => {
        setAvgData(res.data);
      });

    axios
      .get(url + encodeURIComponent(currentYearQueries[crashType.name]))
      .then((res) => {
        setCurrentYearData(res.data);
      });
  }, [crashType]);

  useEffect(() => {
    const formatChartData = (avgData, currentYearData) => {
      const labels = avgData.map((data) => moment(data.month).format("MMM"));
      const avgValues = avgData.map((data) => data.avg);
      const currentYearValues = currentYearData.map((data) => data.total);

      return {
        labels,
        datasets: [
          {
            label: "Five Year Average",
            backgroundColor: colors.viridis3Of6,
            data: avgValues,
            barPercentage: 1.0,
          },
          {
            label: "Total Year to Date",
            backgroundColor: colors.viridis1Of6Highest,
            data: currentYearValues,
            barPercentage: 1.0,
          },
        ],
      };
    };

    const isDataFetched = !!avgData.length && !!currentYearData.length;
    if (isDataFetched) {
      const formattedData = formatChartData(avgData, currentYearData);
      setChartData(formattedData);
    }
  }, [avgData, currentYearData]);

  return (
    <>
      <Bar
        data={chartData}
        width={null}
        height={null}
        options={{
          responsive: true,
          aspectRatio: 1.16,
          maintainAspectRatio: false,
          legend: {
            display: false,
          },
        }}
      />
    </>
  );
};

export default CrashesByYearAverage;
