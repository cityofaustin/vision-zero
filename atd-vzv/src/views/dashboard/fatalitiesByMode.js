import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { Bar } from "react-chartjs-2";

import { Container, Row, Col } from "reactstrap";

// TODO Need modes of vehicle in crash in dataset
// TODO one legend for both pie charts (might need different library)
// Endpoint: https://data.austintexas.gov/resource/y2wy-tgr5.json
// Need to display pie chart (Motor Vehicle, Motorcycle, Pedestrian, Bicycle) of:
// 1. Year-to-date
// 2. Previous year

const FatalitiesByMode = () => {
  const thisYear = moment().format("YYYY");
  const yearLimit = 2010;
  const years = (() => {
    let years = [];
    for (let i = parseInt(thisYear); i >= yearLimit; i--) {
      years.push(i.toString());
    }
    return years;
  })();

  const [chartData, setChartData] = useState("");

  useEffect(() => {
    const getChartData = async () => {
      let newData = {};
      for (const year of years) {
        const url = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=(death_cnt > 0) AND crash_date between '${year}-01-01T00:00:00' and '${year}-12-31T23:59:59'`;

        await axios.get(url).then(res => {
          newData = { ...newData, ...{ [year]: res.data } };
        });
      }
      setChartData(newData);
    };

    getChartData();
  }, []);

  const createChartLabels = () => years.sort().map(year => `${year}`);

  const getMotorData = () =>
    years.map(year => {
      let fatalities = 0;
      !!chartData &&
        chartData[year].forEach(
          f => f["motor_vehicle_fl"] === "Y" && fatalities++
        );
      return fatalities;
    });

  const getPedestrianData = () =>
    years.map(year => {
      let fatalities = 0;
      !!chartData &&
        chartData[year].forEach(
          f => f["pedestrian_fl"] === "Y" && fatalities++
        );
      return fatalities;
    });

  const getPedalcyclistData = () =>
    years.map(year => {
      let fatalities = 0;
      !!chartData &&
        chartData[year].forEach(
          f => f["pedalcyclist_fl"] === "Y" && fatalities++
        );
      return fatalities;
    });

  const data = {
    labels: createChartLabels(),
    datasets: [
      {
        backgroundColor: "rgba(255,99,132,0.2)",
        borderColor: "rgba(255,99,132,1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        label: "Motor",
        data: getMotorData()
      },
      {
        backgroundColor: "rgba(255,99,132,0.2)",
        borderColor: "rgba(255,99,132,1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        label: "Pedestrian",
        data: getPedestrianData()
      },
      {
        backgroundColor: "rgba(255,99,132,0.2)",
        borderColor: "rgba(255,99,132,1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        label: "Pedalcyclist",
        data: getPedalcyclistData()
      }
    ],
    labels: ["label"],
    options: {
      scales: {
        xAxes: [
          {
            stacked: true
          }
        ],
        yAxes: [
          {
            stacked: true
          }
        ]
      }
    }
  };

  return (
    <Container>
      <h3>Fatalities by Mode</h3>
      <Row>
        <Col sm="12">
          <h2>Fatalities by Mode</h2>
          <Bar
            data={data}
            width={100}
            height={50}
            options={{
              maintainAspectRatio: true
            }}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default FatalitiesByMode;
