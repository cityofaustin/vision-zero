import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { Line } from "react-chartjs-2";
import { Container, Row, Col } from "reactstrap";

import CrashTypeSelector from "../nav/CrashTypeSelector";
import { crashEndpointUrl } from "./queries/socrataQueries";
import {
  dataEndDate,
  summaryCurrentYearEndDate,
  yearsArray
} from "../../constants/time";
import { colors } from "../../constants/colors";

const CrashesByMonth = () => {
  // Set years order ascending
  const chartYearsArray = yearsArray().sort((a, b) => b - a);

  const chartColors = [
    colors.viridis1Of6Highest,
    colors.viridis2Of6,
    colors.viridis3Of6,
    colors.viridis4Of6,
    colors.viridis5Of6
  ];

  const [chartData, setChartData] = useState(null); // {yearInt: [monthTotal, monthTotal, ...]}
  const [crashType, setCrashType] = useState([]);

  useEffect(() => {
    const calculateYearMonthlyTotals = data => {
      // Data query is ordered by crash_date ASC so truncate dataset by month of latest record
      const monthLimit =
        data.length > 0
          ? moment(data[data.length - 1].crash_date).format("MM")
          : "12";

      const monthIntegerArray = [
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12"
      ];

      const truncatedMonthIntegerArray = monthIntegerArray.slice(
        0,
        monthIntegerArray.indexOf(monthLimit) + 1
      );
      let cumulativeMonthTotal = 0;
      const monthTotalArray = truncatedMonthIntegerArray.map(month => {
        let monthTotal = 0;
        data.forEach(record => {
          // If the crash date is in the current month, compile data
          if (moment(record.crash_date).format("MM") === month) {
            // Compile data based on the selected crash type
            switch (crashType.name) {
              case "fatalities":
                monthTotal += parseInt(record.death_cnt);
                break;
              case "seriousInjuries":
                monthTotal += parseInt(record.sus_serious_injry_cnt);
                break;
              default:
                monthTotal +=
                  parseInt(record.death_cnt) +
                  parseInt(record.sus_serious_injry_cnt);
                break;
            }
          }
        });
        cumulativeMonthTotal += monthTotal;
        return cumulativeMonthTotal;
      });

      return monthTotalArray;
    };

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
            let url = `${crashEndpointUrl}?$where=${crashType.queryStringCrash} AND crash_date between '${year}-01-01T00:00:00' and '${endDate}'&$order=crash_date ASC`;
            await axios.get(url).then(res => {
              const yearData = calculateYearMonthlyTotals(res.data);
              newData = { ...newData, ...{ [year]: yearData } };
            });
            return null;
          })
        );
        setChartData(newData);
      };
      getChartData();
    }
  }, [crashType]);

  const renderHeader = () => {
    const yearTotalData = chartData[dataEndDate.format("YYYY")];
    // Last item in data array is total YTD
    const yearTotal = yearTotalData[yearTotalData.length - 1];
    return (
      <h6 style={{ color: colors.blue, textAlign: "center" }}>
        As of {dataEndDate.format("MMMM")}, there have been{" "}
        <strong>{yearTotal}</strong> traffic-related{" "}
        {crashType.textString && crashType.textString.toLowerCase()} in{" "}
        {dataEndDate.format("YYYY")}.
      </h6>
    );
  };

  // Create dataset for each year, data property is an array of cumulative totals by month
  const createDatasets = () => {
    const chartDatasets = chartYearsArray.map((year, i) => ({
      label: year,
      fill: false,
      lineTension: 0.1,
      backgroundColor: chartColors[i], // Legend box
      borderColor: chartColors[i],
      borderCapStyle: "butt",
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: "miter",
      pointBorderColor: chartColors[i],
      pointBackgroundColor: chartColors[i],
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: chartColors[i],
      pointHoverBorderColor: chartColors[i],
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: chartData[year]
    }));

    return chartDatasets;
  };

  // Build data objects
  const data = {
    labels: moment.months(),
    datasets: !!chartData && createDatasets()
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1 className="text-left, font-weight-bold">By Year</h1>
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
        <Col>{!!chartData && renderHeader()}</Col>
      </Row>
      <Row>
        <Col>
          <hr className="mt-1"/>
        </Col>
      </Row>
      <Row style={{ paddingBottom: 20 }}>
        <Col>
          <h6 style={{ textAlign: "center" }}>Prior Years:</h6>
        </Col>
        {!!chartData &&
          chartYearsArray.map((year, i) => {
            const yearTotalData = chartData[year];
            const yearTotal = yearTotalData[yearTotalData.length - 1];
            // Return only data from previous years
            return (
              i > 0 && (
                <Col key={i}>
                  <h6 style={{ textAlign: "center" }}>
                    <strong>{!!chartData && yearTotal}</strong> in {year}
                  </h6>
                </Col>
              )
            );
          })}
      </Row>
      <Row>
        <Col>
          <Line
            data={data}
            options={{
              tooltips: {
                mode: "x"
              }
            }}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default CrashesByMonth;
