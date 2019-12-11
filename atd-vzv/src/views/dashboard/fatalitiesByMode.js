import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { Bar } from "react-chartjs-2";

import { Container, Row, Col } from "reactstrap";

const FatalitiesByMode = () => {
  const thisYear = moment().format("YYYY");
  const yearLimit = 10; // Number of years to display in chart
  const yearsArray = (() => {
    let years = [];
    for (let i = 0; i < yearLimit; i++) {
      years.push(parseInt(thisYear) - i);
    }
    return years;
  })();

  const [chartData, setChartData] = useState("");
  const [latestRecordDate, setLatestRecordDate] = useState("");

  // Fetch data (Mode of person who was killed in a crash)
  useEffect(() => {
    const getChartData = async () => {
      let newData = {};
      // Use Promise.all to await all requests to resolve before setting chart data by year
      await Promise.all(
        yearsArray.map(async year => {
          const url = `https://data.austintexas.gov/resource/xecs-rpy9.json?$where=(prsn_injry_sev_id = 4) AND crash_date between '${year}-01-01T00:00:00' and '${year}-12-31T23:59:59'`;

          await axios.get(url).then(res => {
            newData = { ...newData, ...{ [year]: res.data } };
          });
          return null;
        })
      );

      setChartData(newData);
    };

    getChartData();
  }, []);

  // Request latest fatality record from Socrata and set for chart subheading
  useEffect(() => {
    const url = `https://data.austintexas.gov/resource/xecs-rpy9.json?$limit=1&$order=crash_date DESC&$where=crash_date < '${thisYear}-12-31T23:59:59'`;

    axios.get(url).then(res => {
      const latestRecordDate = res.data[0].crash_date;
      const formattedLatestDate = moment(latestRecordDate).format("MMMM YYYY");
      setLatestRecordDate(formattedLatestDate);
    });
  }, []);

  const createChartLabels = () => yearsArray.sort().map(year => `${year}`);

  const getModeData = flag =>
    yearsArray.map(year => {
      let fatalities = 0;

      chartData[year].forEach(f => f[`${flag}`] === "Y" && fatalities++);
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
    motorDataset["data"] = getModeData("motor_vehicle_fl");
    motorDataset["label"] = "Motor";
    motorDataset["backgroundColor"] = "#a50f15";
    motorDataset["borderColor"] = "#a50f15";
    motorDataset["hoverBackgroundColor"] = "#a50f15";
    let motorcycleDataset = { ...datasetTemplate };
    motorcycleDataset["data"] = getModeData("motorcycle_fl");
    motorcycleDataset["label"] = "Motorcycle";
    motorcycleDataset["backgroundColor"] = "#de2d26";
    motorcycleDataset["borderColor"] = "#de2d26";
    motorcycleDataset["hoverBackgroundColor"] = "#de2d26";
    let pedestrianDataset = { ...datasetTemplate };
    pedestrianDataset["data"] = getModeData("pedestrian_fl");
    pedestrianDataset["label"] = "Pedestrian";
    pedestrianDataset["backgroundColor"] = "#fb6a4a";
    pedestrianDataset["borderColor"] = "#fb6a4a";
    pedestrianDataset["hoverBackgroundColor"] = "#fb6a4a";
    let pedalcyclistDataset = { ...datasetTemplate };
    pedalcyclistDataset["data"] = getModeData("pedalcyclist_fl");
    pedalcyclistDataset["label"] = "Pedalcyclist";
    pedalcyclistDataset["backgroundColor"] = "#08519c";
    pedalcyclistDataset["borderColor"] = "#08519c";
    pedalcyclistDataset["hoverBackgroundColor"] = "#08519c";
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
      <h3 className="text-center">Fatalities by Mode</h3>
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
          <p className="text-center">Data Through: {latestRecordDate}</p>
        </Col>
      </Row>
    </Container>
  );
};

export default FatalitiesByMode;
