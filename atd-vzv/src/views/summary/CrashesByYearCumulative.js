import React, { useState, useEffect } from "react";
import moment from "moment";
import { Line } from "react-chartjs-2";
import { colors } from "../../constants/colors";

const CrashesByYearCumulative = ({ avgData, currentYearData }) => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    const formatChartData = (avgData, currentYearData) => {
      const labels = avgData.map((data) =>
        moment({ month: parseInt(data.month) - 1 }).format("MMM")
      );
      const avgValues = avgData.reduce((acc, data, i) => {
        i === 0 && acc.push(parseFloat(data.avg));
        i !== 0 && acc.push(acc[i - 1] + parseFloat(data.avg));
        return acc;
      }, []);
      const currentYearValues =
        // currentYearData.map((data) => data.total);
        currentYearData.reduce((acc, data, i) => {
          i === 0 && acc.push(parseInt(data.total));
          i !== 0 && acc.push(acc[i - 1] + parseInt(data.total));
          return acc;
        }, []);

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
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      }}
    />
  );
};

export default CrashesByYearCumulative;
