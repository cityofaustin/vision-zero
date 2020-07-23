import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { Line } from "react-chartjs-2";
import { Container, Row, Col } from "reactstrap";
import styled from "styled-components";

import { crashEndpointUrl } from "./queries/socrataQueries";
import {
  dataEndDate,
  summaryCurrentYearEndDate,
  yearsArray,
} from "../../constants/time";
import { colors } from "../../constants/colors";

const CrashesByYearCumulative = ({ avgData, currentYearData }) => {
  // Set years order ascending
  const chartYearsArray = yearsArray().sort((a, b) => b - a);

  const [chartData, setChartData] = useState(null); // {yearInt: [monthTotal, monthTotal, ...]}

  // useEffect(() => {
  //   const calculateYearMonthlyTotals = (data) => {
  //     // Determine if the data is a complete year or not and which records to process
  //     const isCurrentYear =
  //       data.length > 0 &&
  //       data[0].crash_date.includes(dataEndDate.format("YYYY"));

  //     const monthLimit = isCurrentYear ? dataEndDate.format("MM") : "12";

  //     let monthTotalArray = [];
  //     for (let i = 1; i <= parseInt(monthLimit); i++) {
  //       monthTotalArray.push(0);
  //     }

  //     // Calculate totals for each month in data
  //     const monthTotals = data.reduce((acc, record) => {
  //       const recordMonth = moment(record.crash_date).format("MM");
  //       const monthIndex = parseInt(recordMonth) - 1;

  //       if (monthIndex < monthTotalArray.length) {
  //         switch (crashType.name) {
  //           case "fatalities":
  //             acc[monthIndex] += parseInt(record.death_cnt);
  //             break;
  //           case "seriousInjuries":
  //             acc[monthIndex] += parseInt(record.sus_serious_injry_cnt);
  //             break;
  //           default:
  //             acc[monthIndex] +=
  //               parseInt(record.death_cnt) +
  //               parseInt(record.sus_serious_injry_cnt);
  //             break;
  //         }
  //       }
  //       return acc;
  //     }, monthTotalArray);

  //     // Accumulate the monthly totals over the year of data
  //     const accumulatedTotals = monthTotals.reduce((acc, month, i) => {
  //       acc.push((month += acc[i - 1] || 0));
  //       return acc;
  //     }, []);

  //     return accumulatedTotals;
  //   };

  //   // Wait for crashType to be passed up from setCrashType component
  //   if (crashType.queryStringCrash) {
  //     const getChartData = async () => {
  //       let newData = {};
  //       // Use Promise.all to let all requests resolve before setting chart data by year
  //       await Promise.all(
  //         yearsArray().map(async (year) => {
  //           // If getting data for current year (only including years past January), set end of query to last day of previous month,
  //           // else if getting data for previous years, set end of query to last day of year
  //           let endDate =
  //             year.toString() === dataEndDate.format("YYYY")
  //               ? `${summaryCurrentYearEndDate}T23:59:59`
  //               : `${year}-12-31T23:59:59`;
  //           let url = `${crashEndpointUrl}?$where=${crashType.queryStringCrash} AND crash_date between '${year}-01-01T00:00:00' and '${endDate}'&$order=crash_date ASC`;
  //           await axios.get(url).then((res) => {
  //             const yearData = calculateYearMonthlyTotals(res.data);
  //             newData = { ...newData, ...{ [year]: yearData } };
  //           });
  //           return null;
  //         })
  //       );
  //       setChartData(newData);
  //     };
  //     getChartData();
  //   }
  // }, [crashType]);

  // useEffect(() => {
  //   !!chartRef.current &&
  //     !!chartData &&
  //     setChartLegend(chartRef.current.chartInstance.generateLegend());
  // }, [chartData, legendColors]);

  // Create dataset for each year, data property is an array of cumulative totals by month
  // const createDatasets = () => {
  //   const chartDatasets = chartYearsArray.map((year, i) => ({
  //     label: year,
  //     fill: false,
  //     lineTension: 0.1,
  //     backgroundColor: chartColors[i], // Legend box
  //     borderColor: chartColors[i],
  //     borderCapStyle: "butt",
  //     borderDash: [],
  //     borderDashOffset: 0.0,
  //     borderJoinStyle: "miter",
  //     pointBorderColor: chartColors[i],
  //     pointBackgroundColor: chartColors[i],
  //     pointBorderWidth: 1,
  //     pointHoverRadius: 5,
  //     pointHoverBackgroundColor: chartColors[i],
  //     pointHoverBorderColor: chartColors[i],
  //     pointHoverBorderWidth: 2,
  //     pointRadius: 1,
  //     pointHitRadius: 10,
  //     data: chartData[year],
  //   }));

  //   return chartDatasets;
  // };

  // // Build data objects
  // const data = {
  //   labels: moment.monthsShort(),
  //   datasets: !!chartData && createDatasets(),
  // };

  useEffect(() => {
    const formatChartData = (avgData, currentYearData) => {
      const labels = avgData.map((data) =>
        moment({ month: parseInt(data.month) - 1 }).format("MMM")
      );
      const avgValues = avgData.map((data) => data.avg);
      const currentYearValues = currentYearData.map((data) => data.total);

      return {
        labels,
        datasets: [
          {
            label: "Five Year Average",
            fill: false,
            lineTension: 0.1,
            backgroundColor: colors.viridis3Of6,
            borderColor: colors.viridis3Of6,
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: colors.viridis3Of6,
            pointBackgroundColor: colors.viridis3Of6,
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: colors.viridis3Of6,
            pointHoverBorderColor: colors.viridis3Of6,
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: avgValues,
          },
          {
            label: "Total Year to Date",
            fill: false,
            lineTension: 0.1,
            backgroundColor: colors.viridis1Of6Highest,
            borderColor: colors.viridis1Of6Highest,
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: colors.viridis1Of6Highest,
            pointBackgroundColor: colors.viridis1Of6Highest,
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: colors.viridis1Of6Highest,
            pointHoverBorderColor: colors.viridis1Of6Highest,
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: currentYearValues,
          },
        ],
      };
    };

    const isDataFetched = !!avgData.length && !!currentYearData.length;

    if (isDataFetched) {
      const formattedData = formatChartData(avgData, currentYearData);
      console.log(formattedData);
      setChartData(formattedData);
    }
  }, [avgData, currentYearData]);

  return (
    <>
      {
        // Wrapping the chart in a div prevents it from getting caught in a rerendering loop
        <Container>
          <Line
            data={chartData}
            height={null}
            width={null}
            options={{
              responsive: true,
              aspectRatio: 1.16,
              maintainAspectRatio: false,
              tooltips: {
                mode: "x",
              },
              legend: {
                display: false,
              },
            }}
          />
        </Container>
      }
    </>
  );
};

export default CrashesByYearCumulative;
