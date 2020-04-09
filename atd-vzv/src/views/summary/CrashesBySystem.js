import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Container, Row, Col } from "reactstrap";

import CrashTypeSelector from "../nav/CrashTypeSelector";
import { colors } from "../../constants/colors";
import {
  dataEndDate,
  yearsArray,
  summaryCurrentYearEndDate,
} from "../../constants/time";
import { crashEndpointUrl } from "./queries/socrataQueries";

const CrashesBySystem = () => {
  // Both categories use the same flag but are based on different ("Y" or "N") values.
  // In the future we may consider adding another category using the "private_dr_fl" flag
  // to show crashes that have occurred on private driveways.
  const categories = [
    {
      label: "On TxDOT System",
      flags: ["onsys_fl"],
      value: "Y",
      color: `${colors.viridis1Of6Highest}`,
    },
    {
      label: "Off TxDOT System",
      flags: ["onsys_fl"],
      value: "N",
      color: `${colors.viridis2Of6}`,
    },
  ];

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
          yearsArray().map(async (year) => {
            // If getting data for current year (only including years past January), set end of query to last day of previous month,
            // else if getting data for previous years, set end of query to last day of year
            let endDate =
              year.toString() === dataEndDate.format("YYYY")
                ? `${summaryCurrentYearEndDate}T23:59:59`
                : `${year}-12-31T23:59:59`;
            let url = `${crashEndpointUrl}?$where=${crashType.queryStringCrash} AND crash_date between '${year}-01-01T00:00:00' and '${endDate}'`;
            await axios.get(url).then((res) => {
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

  const createChartLabels = () => yearsArray().map((year) => `${year}`);

  // Tabulate crashes by flags in data
  const getCategoryData = (flags, value) =>
    yearsArray().map((year) => {
      return chartData[year].reduce((accumulator, record) => {
        // For each flag, count records where the record's flag value matches the category's flag value ("Y" or "N")
        flags.forEach((flag) => record[`${flag}`] === value && accumulator++);
        return accumulator;
      }, 0);
    });

  // Sort category order in stack by averaging total category crashes across all years in chart
  const sortCategoryData = (data) => {
    const averageCategoryCrashes = (categoryDataArray) =>
      categoryDataArray.reduce((a, b) => a + b) / categoryDataArray.length;
    return data.sort(
      (a, b) => averageCategoryCrashes(b.data) - averageCategoryCrashes(a.data)
    );
  };

  // Create dataset for each category, data property is an array of crash sums sorted chronologically
  const createCategoryDatasets = () => {
    const data = categories.map((category) => ({
      backgroundColor: category.color,
      borderColor: category.color,
      borderWidth: 2,
      hoverBackgroundColor: category.color,
      hoverBorderColor: category.color,
      label: category.label,
      data: getCategoryData(category.flags, category.value),
    }));
    // Determine order of categoriess in each year stack
    return sortCategoryData(data);
  };

  const data = {
    labels: createChartLabels(),
    datasets: !!chartData && createCategoryDatasets(),
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1 className="text-left, font-weight-bold">By Jurisdiction</h1>
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
      <Row>
        <Col>
          <Bar
            data={data}
            options={{
              maintainAspectRatio: true,
              scales: {
                xAxes: [
                  {
                    stacked: true,
                  },
                ],
                yAxes: [
                  {
                    stacked: true,
                  },
                ],
              },
            }}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default CrashesBySystem;
