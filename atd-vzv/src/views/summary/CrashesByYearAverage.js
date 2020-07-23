import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { Bar } from "react-chartjs-2";
import { Container, Col, Row } from "reactstrap";

import { crashEndpointUrl } from "./queries/socrataQueries";
import {
  dataEndDate,
  summaryCurrentYearEndDate,
  dataStartDate,
  summaryCurrentYearStartDate,
} from "../../constants/time";
import { colors } from "../../constants/colors";

const CrashesByYearAverage = ({ crashType }) => {
  const [chartData, setChartData] = useState({});
  const [avgData, setAvgData] = useState([]);
  const [currentYearData, setCurrentYearData] = useState([]);

  useEffect(() => {
    const url = `${crashEndpointUrl}?$query=`;

    const avgDateCondition = `crash_date BETWEEN '${dataStartDate.format(
      "YYYY-MM-DD"
    )}' and '${dataEndDate.format("YYYY-MM-DD")}'`;
    const currentYearDateCondition = `crash_date BETWEEN '${summaryCurrentYearStartDate}' and '${summaryCurrentYearEndDate}'`;
    const queryGroupAndOrder = `GROUP BY month ORDER BY month`;

    const avgQueries = {
      fatalities: `SELECT date_extract_m(crash_date) as month, sum(death_cnt) / 5 as avg 
                   WHERE death_cnt > 0 AND ${avgDateCondition} ${queryGroupAndOrder}`,
      fatalitiesAndSeriousInjuries: `SELECT date_extract_m(crash_date) as month, sum(death_cnt) / 5 + sum(sus_serious_injry_cnt) / 5 as avg 
                                     WHERE (death_cnt > 0 OR sus_serious_injry_cnt > 0) AND ${avgDateCondition} ${queryGroupAndOrder}`,
      seriousInjuries: `SELECT date_extract_m(crash_date) as month, sum(sus_serious_injry_cnt) / 5 as avg 
                        WHERE sus_serious_injry_cnt > 0 AND ${avgDateCondition} ${queryGroupAndOrder}`,
    };

    const currentYearQueries = {
      fatalities: `SELECT date_extract_m(crash_date) as month, sum(death_cnt) as total 
                   WHERE death_cnt > 0 AND ${currentYearDateCondition} ${queryGroupAndOrder}`,
      fatalitiesAndSeriousInjuries: `SELECT date_extract_m(crash_date) as month, sum(death_cnt) + sum(sus_serious_injry_cnt) as total 
                                     WHERE (death_cnt > 0 OR sus_serious_injry_cnt > 0) AND ${currentYearDateCondition} ${queryGroupAndOrder}`,
      seriousInjuries: `SELECT date_extract_m(crash_date) as month, sum(sus_serious_injry_cnt) as total 
                        WHERE sus_serious_injry_cnt > 0 AND ${currentYearDateCondition} ${queryGroupAndOrder}`,
    };

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
      const labels = avgData.map((data) =>
        moment({ month: parseInt(data.month) - 1 }).format("MMM")
      );
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
      </Row>
      <Container>
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
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true,
                  },
                },
              ],
            },
          }}
        />
      </Container>
    </>
  );
};

export default CrashesByYearAverage;
