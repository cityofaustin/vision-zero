import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Container, Row, Col } from "reactstrap";

import CrashTypeSelector from "../nav/CrashTypeSelector";
import { colors } from "../../constants/colors";
import {
  dataEndDate,
  thisYear,
  ROLLING_YEARS_OF_DATA
} from "../../constants/time";
import { demographicsEndpointUrl } from "./queries/socrataQueries";

const FatalitiesByMode = () => {
  const modes = [
    {
      label: "Motorist",
      flags: ["motor_vehicle_fl"],
      color: colors.chartRed
    },
    {
      label: "Pedestrian",
      flags: ["pedestrian_fl"],
      color: colors.chartOrange
    },
    {
      label: "Motorcyclist",
      flags: ["motorcycle_fl"],
      color: colors.chartRedOrange
    },
    {
      label: "Bicyclist",
      flags: ["bicycle_fl"],
      color: colors.chartBlue
    },
    {
      label: "Other",
      flags: ["other_fl"],
      color: colors.chartLightBlue
    }
  ];

  // Create array of ints of last 5 years
  const yearsArray = useCallback(() => {
    let years = [];
    let year = parseInt(dataEndDate.format("YYYY"));
    for (let i = 0; i <= ROLLING_YEARS_OF_DATA; i++) {
      years.unshift(year - i);
    }
    return years;
  }, []);

  const [chartData, setChartData] = useState(""); // {yearInt: [{record}, {record}, ...]}
  const [crashType, setCrashType] = useState([]);

  // Fetch data and set in state by years in yearsArray
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
                ? `${dataEndDate.format("YYYY-MM-DD")}T23:59:59`
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

  const createChartLabels = () => yearsArray().map(year => `${year}`);

  // Tabulate fatalities by mode flags in data
  const getModeData = flags =>
    yearsArray().map(year => {
      return chartData[year].reduce((accumulator, record) => {
        flags.forEach(flag => record[`${flag}`] === "Y" && accumulator++);
        return accumulator;
      }, 0);
    });

  // Sort mode order in stack by averaging total mode fatalities across all years in chart
  const sortModeData = modeData => {
    const averageModeFatalities = modeDataArray =>
      modeDataArray.reduce((a, b) => a + b) / modeDataArray.length;
    return modeData.sort(
      (a, b) => averageModeFatalities(b.data) - averageModeFatalities(a.data)
    );
  };

  // Create dataset for each mode type, data property is an array of fatality sums sorted chronologically
  const createTypeDatasets = () => {
    const modeData = modes.map(mode => ({
      backgroundColor: mode.color,
      borderColor: mode.color,
      borderWidth: 2,
      hoverBackgroundColor: mode.color,
      hoverBorderColor: mode.color,
      label: mode.label,
      data: getModeData(mode.flags)
    }));
    // Determine order of modes in each year stack
    return sortModeData(modeData);
  };

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
          <p className="text-center">Data Through: {dataEndDate.format("MMMM YYYY")}</p>
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
