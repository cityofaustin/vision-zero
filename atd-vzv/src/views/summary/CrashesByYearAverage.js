import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import styled from "styled-components";
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

  const StyledDiv = styled.div`
    .year-total-div {
      color: ${colors.dark};
      background: ${colors.buttonBackground} 0% 0% no-repeat padding-box;
      border-radius: 4px;
      border-style: none;
      opacity: 1;
    }

    .year-total-div:hover {
      cursor: pointer;
      color: ${colors.buttonBackground};
      background: dimgray 0% 0% no-repeat padding-box;
    }
  `;

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
        <Col xs={4} s={2} m={2} l={2} xl={2}>
          <StyledDiv>
            <div className="year-total-div">
              <hr
                className="my-1"
                style={{
                  border: `4px solid ${colors.viridis3Of6}`,
                }}
              ></hr>
              <h4 className="h6 text-center py-1 mb-0">
                <strong>Title</strong>
              </h4>
              <hr className="my-1"></hr>
              <h4 className="h6 text-center py-1">Total</h4>
            </div>
          </StyledDiv>
        </Col>
        <Col xs={4} s={2} m={2} l={2} xl={2}>
          <StyledDiv>
            <div className="year-total-div">
              <hr
                className="my-1"
                style={{
                  border: `4px solid ${colors.viridis1Of6Highest}`,
                }}
              ></hr>
              <h4 className="h6 text-center py-1 mb-0">
                <strong>Title 1</strong>
              </h4>
              <hr className="my-1"></hr>
              <h4 className="h6 text-center py-1">Total 1</h4>
            </div>
          </StyledDiv>
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
