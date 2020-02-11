import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import moment from "moment";
import { Bar } from "react-chartjs-2";

import CrashTypeSelector from "../nav/CrashTypeSelector";
import { colors } from "../../constants/colors";

import { Container, Row, Col } from "reactstrap";
import {
  thisMonth,
  thisYear,
  lastYear,
  lastMonth,
  lastDayOfLastMonth
} from "../../constants/time";
import { demographicsEndpointUrl } from "./queries/socrataQueries";

const FatalitiesByMode = () => {
  // Define stacked bar chart properties in order of stack
  const modes = [
    { label: "Motor", flag: "motor_vehicle_fl", color: colors.chartRed },
    { label: "Pedestrian", flag: "pedestrian_fl", color: colors.chartOrange },
    {
      label: "Motorcycle",
      flag: "motorcycle_fl",
      color: colors.chartRedOrange
    },
    { label: "Pedalcyclist", flag: "pedalcyclist_fl", color: colors.chartBlue }
  ];
  const yearLimit = 10; // Number of years to display in chart
  const yearsArray = useCallback(() => {
    let years = [];
    // If it is past January, display data up to and including current year,
    // else if it is January, only display data up to the end of last year
    let year = thisMonth > "01" ? thisYear : lastYear;
    for (let i = 0; i < yearLimit; i++) {
      years.push(parseInt(year) - i);
    }
    return years;
  }, []);

  const [chartData, setChartData] = useState("");
  const [latestRecordDate, setLatestRecordDate] = useState("");
  const [crashType, setCrashType] = useState([]);

  // Fetch data (Mode of fatality in crash)
  useEffect(() => {
    // Wait for crashType to be passed up from setCrashType component
    if (crashType.queryStringDemographics) {
      const getChartData = async () => {
        let newData = {};
        // Use Promise.all to let all requests resolve before setting chart data by year
        await Promise.all(
          yearsArray().map(async year => {
            // If getting data for current year (only including years past January), set end of query to last day of previous month,
            // else if getting data for previous years, set end of query to last day of year
            let endDate =
              year.toString() === thisYear
                ? `${year}-${lastMonth}-${lastDayOfLastMonth}T23:59:59`
                : `${year}-12-31T23:59:59`;
            let url = `${demographicsEndpointUrl}?$where=${crashType.queryStringDemographics} AND crash_date between '${year}-01-01T00:00:00' and '${endDate}'`;
            await axios.get(url).then(res => {
              newData = { ...newData, ...{ [year]: res.data } };
            });
            return null;
          })
        );
        setChartData(newData);
      };
      getChartData();
    }
  }, [yearsArray, crashType]);

  // Fetch latest record from demographics dataset and set for chart subheading
  useEffect(() => {
    // If it is past January, set end of query to last day of previous month,
    // else if it is January, set end of query to last day of last year
    let endDate =
      thisMonth > "01"
        ? `${thisYear}-${lastMonth}-${lastDayOfLastMonth}T23:59:59`
        : `${lastYear}-12-31T23:59:59`;
    let url = `${demographicsEndpointUrl}?$limit=1&$order=crash_date DESC&$where=crash_date < '${endDate}'`;
    axios.get(url).then(res => {
      const latestRecordDate = res.data[0].crash_date;
      const formattedLatestDate = moment(latestRecordDate).format("MMMM YYYY");
      setLatestRecordDate(formattedLatestDate);
    });
  }, []);

  const createChartLabels = () =>
    yearsArray()
      .sort()
      .map(year => `${year}`);

  // Tabulate crashes by mode from data
  const getModeData = flag =>
    yearsArray()
      .sort()
      .map(year => {
        let crashes = 0;
        chartData[year].forEach(f => f[`${flag}`] === "Y" && crashes++);
        return crashes;
      });

  // Create dataset for each mode type
  // data property is an array of fatality sums sorted chronologically
  const createTypeDatasets = () =>
    modes.map(mode => ({
      backgroundColor: mode.color,
      borderColor: mode.color,
      borderWidth: 2,
      hoverBackgroundColor: mode.color,
      hoverBorderColor: mode.color,
      label: mode.label,
      data: getModeData(mode.flag)
    }));

  const data = {
    labels: createChartLabels(),
    datasets: !!chartData && createTypeDatasets()
  };

  return (
    <Container>
      <Row style={{ paddingBottom: "0.75em" }}>
        <Col>
          <h3 style={{ textAlign: "center" }}>
            {crashType.textString} by Mode
          </h3>
        </Col>
      </Row>
      <Row>
        <Col>
          <Bar
            data={data}
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
      <Row>
        <Col>
          <p className="text-center">Data Through: {latestRecordDate}</p>
        </Col>
      </Row>
      <Row style={{ paddingTop: "0.75em" }}>
        <Col>
          <CrashTypeSelector setCrashType={setCrashType} />
        </Col>
      </Row>
    </Container>
  );
};

export default FatalitiesByMode;
