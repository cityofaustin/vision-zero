import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { Bar } from "react-chartjs-2";

import { Container, Row, Col } from "reactstrap";

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

  const datasetTemplate = {
    backgroundColor: "rgba(255,99,132,0.2)",
    borderColor: "rgba(255,99,132,1)",
    borderWidth: 1,
    hoverBackgroundColor: "rgba(255,99,132,0.4)",
    hoverBorderColor: "rgba(255,99,132,1)",
    label: "",
    data: []
  };

  const createTypeDatasets = () => {
    let datasets = [];
    let motorDataset = { ...datasetTemplate };
    motorDataset["data"] = getMotorData();
    motorDataset["label"] = "Motor";
    let pedestrianDataset = { ...datasetTemplate };
    pedestrianDataset["data"] = getPedestrianData();
    pedestrianDataset["label"] = "Pedestrian";
    let pedalcyclistDataset = { ...datasetTemplate };
    pedalcyclistDataset["data"] = getPedalcyclistData();
    pedalcyclistDataset["label"] = "Pedalcyclist";
    return [...datasets, motorDataset, pedestrianDataset, pedalcyclistDataset];
  };

  const data = {
    labels: createChartLabels(),
    datasets: !!chartData && createTypeDatasets()
  };

  return (
    <Container>
      <h3>Fatalities by Mode</h3>
      <Row>
        <Col sm="12">
          <Bar
            data={data}
            width={100}
            height={100}
            options={{
              maintainAspectRatio: true,
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
            }}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default FatalitiesByMode;
