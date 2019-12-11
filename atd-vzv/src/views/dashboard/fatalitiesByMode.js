import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { Bar } from "react-chartjs-2";

import { Container, Row, Col } from "reactstrap";

const FatalitiesByMode = () => {
  const thisYear = moment().format("YYYY");
  const yearLimit = 10;
  const years = (() => {
    let years = [];
    for (let i = 0; i < yearLimit; i++) {
      years.push(parseInt(thisYear) - i);
    }
    return years;
  })();

  const [chartData, setChartData] = useState("");

  // Pull data from demographics (Mode of person who was killed in a crash)
  useEffect(() => {
    const getChartData = async () => {
      let newData = {};
      for (const year of years) {
        const url = `https://data.austintexas.gov/resource/xecs-rpy9.json?$where=(prsn_injry_sev_id = 4) AND crash_date between '${year}-01-01T00:00:00' and '${year}-12-31T23:59:59'`;

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

  const getMotorcycleData = () =>
    years.map(year => {
      let fatalities = 0;
      !!chartData &&
        chartData[year].forEach(
          f => f["motorcycle_fl"] === "Y" && fatalities++
        );
      return fatalities;
    });

  const datasetTemplate = {
    backgroundColor: "",
    borderColor: "",
    borderWidth: 2,
    hoverBackgroundColor: "",
    hoverBorderColor: "",
    label: "",
    data: []
  };

  const createTypeDatasets = () => {
    let datasets = [];
    let motorDataset = { ...datasetTemplate };
    motorDataset["data"] = getMotorData();
    motorDataset["label"] = "Motor";
    motorDataset["backgroundColor"] = "#a50f15";
    motorDataset["borderColor"] = "#a50f15";
    let motorcycleDataset = { ...datasetTemplate };
    motorcycleDataset["data"] = getMotorcycleData();
    motorcycleDataset["label"] = "Motorcycle";
    motorcycleDataset["backgroundColor"] = "#de2d26";
    motorcycleDataset["borderColor"] = "#de2d26";
    let pedestrianDataset = { ...datasetTemplate };
    pedestrianDataset["data"] = getPedestrianData();
    pedestrianDataset["label"] = "Pedestrian";
    pedestrianDataset["backgroundColor"] = "#fb6a4a";
    pedestrianDataset["borderColor"] = "#fb6a4a";
    let pedalcyclistDataset = { ...datasetTemplate };
    pedalcyclistDataset["data"] = getPedalcyclistData();
    pedalcyclistDataset["label"] = "Pedalcyclist";
    pedalcyclistDataset["backgroundColor"] = "#08519c";
    pedalcyclistDataset["borderColor"] = "#08519c";
    return [
      ...datasets,
      motorDataset,
      pedestrianDataset,
      motorcycleDataset,
      pedalcyclistDataset
    ];
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
