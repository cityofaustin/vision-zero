import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Container, Row, Col } from "reactstrap";

import CrashTypeSelector from "../nav/CrashTypeSelector";
import { colors } from "../../constants/colors";
import {
  dataEndDate,
  yearsArray,
  summaryCurrentYearEndDate
} from "../../constants/time";
import { crashTestEndpointUrl } from "./queries/socrataQueries";

const CrashesBySystem = () => {

  const systems = [
    {
      label: "TxDOT System",
      flags: ["onsys_fl"],
      color: `${colors.chartRed}`
    },
    {
      label: "Private",
      flags: ["private_dr_fl"],
      color: `${colors.chartLightBlue}`
    }
  ]

  const [chartData, setChartData] = useState(null); // {yearInt: [{record}, {record}, ...]}
  const [crashType, setCrashType] = useState([]);

  // Fetch data and set in state by years in yearsArray
  useEffect(() => {
    // Wait for crashType to be passed up from setCrashType component
    if (crashType.queryStringCrash) {
      const getChartData = async () => {
        let newData = {};
        // Use Promise.all to let all requests resolve before setting chart data by year
        await Promise.all(
          yearsArray().map(async year => {
            // If getting data for current year (only including years past January), set end of query to last day of previous month,
            // else if getting data for previous years, set end of query to last day of year
            let endDate =
              year.toString() === dataEndDate.format("YYYY")
                ? `${summaryCurrentYearEndDate}T23:59:59`
                : `${year}-12-31T23:59:59`;
            let url = `${crashTestEndpointUrl}?$where=${crashType.queryStringCrash} AND crash_date between '${year}-01-01T00:00:00' and '${endDate}'`;
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
  }, [crashType]);

  const createChartLabels = () => yearsArray().map(year => `${year}`);

  // Tabulate fatalities by flags in data
  const getData = flags =>
    yearsArray().map(year => {
      return chartData[year].reduce((accumulator, record) => {
        flags.forEach(flag => record[`${flag}`] === "Y" && accumulator++);
        return accumulator;
      }, 0);
    });

  // Sort system order in stack by averaging total system crashes across all years in chart
  const sortData = data => {
    const averageCrashes = dataArray =>
      dataArray.reduce((a, b) => a + b) / dataArray.length;
    return data.sort(
      (a, b) => averageCrashes(b.data) - averageCrashes(a.data)
    );
  };

  // Create dataset for each system type, data property is an array of crash sums sorted chronologically
  const createTypeDatasets = () => {
    const data = systems.map(system => ({
      backgroundColor: system.color,
      borderColor: system.color,
      borderWidth: 2,
      hoverBackgroundColor: system.color,
      hoverBorderColor: system.color,
      label: system.label,
      data: getData(system.flags)
    }));
    // Determine order of systems in each year stack
    return sortData(data);
  };

  const data = {
    labels: createChartLabels(),
    datasets: !!chartData && createTypeDatasets()
  };

  !!data.datasets && console.log(data);

  return (
    <Container>
      <Row className="pb-3">
        <Col>
        <h3 className="text-center">
            {crashType.textString} by System
          </h3>
        </Col>
      </Row>        
      <Row className="pt-3">
        <Col>
          <CrashTypeSelector setCrashType={setCrashType} />
        </Col>
      </Row>
    </Container>
  )
}

export default CrashesBySystem;