import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { Bar } from "react-chartjs-2";
import { Container, Row, Col } from "reactstrap";

import CrashTypeSelector from "./Components/CrashTypeSelector";
import InfoPopover from "../../Components/Popover/InfoPopover";
import { popoverConfig } from "../../Components/Popover/popoverConfig";
import { crashEndpointUrl } from "./queries/socrataQueries";
import { dataStartDate, fiveYearAvgEndDate } from "../../constants/time";
import { colors } from "../../constants/colors";

const CrashesByPopulation = () => {
  const [crashType, setCrashType] = useState(null);
  const [chartData, setChartData] = useState({});

  const url = `${crashEndpointUrl}?$query=`;

  useEffect(() => {
    const dateCondition = `crash_date BETWEEN '${dataStartDate.format(
      "YYYY-MM-DD"
    )}' and '${fiveYearAvgEndDate}'`;
    const queryGroupAndOrder = `GROUP BY year ORDER BY year`;

    const queries = {
      fatalities: `SELECT date_extract_y(crash_date) as year, sum(death_cnt) as total 
                   WHERE death_cnt > 0 AND ${dateCondition} ${queryGroupAndOrder}`,
      fatalitiesAndSeriousInjuries: `SELECT date_extract_y(crash_date) as year, sum(death_cnt) + sum(sus_serious_injry_cnt) as total 
                                     WHERE (death_cnt > 0 OR sus_serious_injry_cnt > 0) AND ${dateCondition} ${queryGroupAndOrder}`,
      seriousInjuries: `SELECT date_extract_y(crash_date) as year, sum(sus_serious_injry_cnt) as total 
                        WHERE sus_serious_injry_cnt > 0 AND ${dateCondition} ${queryGroupAndOrder}`,
    };

    const chartConfig = {
      barOne: { color: colors.viridis1Of6Highest, population: 913917 },
      barTwo: { color: colors.viridis1Of6Highest, population: 937065 },
      barThree: { color: colors.viridis1Of6Highest, population: 955094 },
      barFour: { color: colors.viridis1Of6Highest, population: 972499 },
    };

    const calculateRatePer100000 = (data) => {
      const round = (num) => Math.floor(num * 10) / 10;

      return data.map((year, i) => {
        const population = Object.values(chartConfig)[i].population;
        const rate = (year.total / population) * 100000;
        year.total = round(rate);
        return year;
      });
    };

    const formatChartData = (data) => {
      const labels = data.map((year) => year.year);
      const rateValues = data.map((year) => year.total);
      const colors = Object.values(chartConfig).map((bar) => bar.color);

      return {
        labels,
        datasets: [
          {
            label: "Ratio",
            backgroundColor: colors,
            hoverBackgroundColor: colors,
            data: rateValues,
            barPercentage: 1.0,
          },
        ],
      };
    };

    !!crashType &&
      axios
        .get(url + encodeURIComponent(queries[crashType.name]))
        .then((res) => {
          const calculatedData = calculateRatePer100000(res.data);
          const formattedData = formatChartData(calculatedData);
          setChartData(formattedData);
        });
  }, [crashType, url]);

  const StyledDiv = styled.div`
    .year-total-div {
      color: ${colors.dark};
      background: ${colors.buttonBackground};
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
            By Population (Rate Per 100,000){" "}
            <InfoPopover config={popoverConfig.summary.byPopulation} />
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
      <Row className="pb-2">
        <Col xs={4} s={2} m={2} l={2} xl={2}>
          <div>
            <h3 className="h6 text-center pt-2 my-1">
              <strong>Year</strong>
            </h3>
            <hr className="my-1"></hr>
            <h3 className="h6 text-center py-1">Ratio</h3>
          </div>
        </Col>
        {!!chartData &&
          chartData.labels &&
          chartData.labels.map((year, i) => (
            <Col xs={4} s={2} m={2} l={2} xl={2} key={i}>
              <StyledDiv>
                <div className="year-total-div">
                  <h6 className="text-center pt-2 my-1">
                    <strong>{year}</strong>
                  </h6>
                  <hr className="my-1"></hr>
                  <h6 className="text-center py-1">
                    {chartData.datasets[0].data[i]}
                  </h6>
                </div>
              </StyledDiv>
            </Col>
          ))}
      </Row>
      <Row className="mt-1">
        <Col>
          <Bar
            data={chartData}
            width={null}
            height={null}
            options={{
              responsive: true,
              aspectRatio: 0.849,
              maintainAspectRatio: false,
              tooltips: {
                mode: "index",
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
              legend: {
                display: false,
              },
            }}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default CrashesByPopulation;
