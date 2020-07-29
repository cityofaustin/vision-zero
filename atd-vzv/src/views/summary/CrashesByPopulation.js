import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Container, Row, Col } from "reactstrap";

import CrashTypeSelector from "./Components/CrashTypeSelector";
import { crashEndpointUrl } from "./queries/socrataQueries";
import { dataStartDate, fiveYearAvgEndDate } from "../../constants/time";
import { colors } from "../../constants/colors";

const CrashesByPopulation = () => {
  const chartConfig = {
    barOne: { color: colors.viridis5Of6, population: 913917 },
    barTwo: { color: colors.viridis4Of6, population: 937065 },
    barThree: { color: colors.viridis3Of6, population: 955094 },
    barFour: { color: colors.viridis1Of6Highest, population: 972499 },
  };

  const [crashType, setCrashType] = useState(null);
  const [chartData, setChartData] = useState([]);

  const url = `${crashEndpointUrl}?$query=`;

  // Fetch data for By Month Average and Cumulative visualizations
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

    const calculateRatePer100000 = (data) => {
      const round = (num) => Math.floor(num * 10) / 10;

      data.map((year, i) => {
        const population = Object.values(chartConfig)[i].population;
        const rate = (year.total / population) * 100000;
        year.total = round(rate);
        return year;
      });
    };

    !!crashType &&
      axios
        .get(url + encodeURIComponent(queries[crashType.name]))
        .then((res) => {
          setChartData(calculateRatePer100000(res.data));
        });
  }, [crashType, url, chartConfig]);

  return (
    <Container className="m-0 p-0">
      <Row>
        <Col>
          <h2 className="text-left font-weight-bold">
            By Population (Rate Per 100,000)
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
        <Col>
          {JSON.stringify(chartData)}
          {/* <Bar
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
                onClick: (e) => e.stopPropagation(),
              },
            }}
          /> */}
        </Col>
      </Row>
    </Container>
  );
};

export default CrashesByPopulation;
