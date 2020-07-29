import React, { useState, useEffect } from "react";
import moment from "moment";
import { Bar } from "react-chartjs-2";

import { colors } from "../../constants/colors";

const CrashesByYearAverage = ({ avgData, currentYearData }) => {
  const [chartData, setChartData] = useState({});

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
            backgroundColor: colors.viridis3Of6,
            hoverBackgroundColor: colors.viridis3Of6,
            data: avgValues,
            barPercentage: 1.0,
          },
          {
            label: "Current Year",
            backgroundColor: colors.viridis1Of6Highest,
            hoverBackgroundColor: colors.viridis1Of6Highest,
            data: currentYearValues,
            barPercentage: 1.0,
          },
        ],
      };
    };

    const isDataFetched = !!avgData.length && !!currentYearData.length;

    if (isDataFetched) {
      const formattedData = formatChartData(avgData, currentYearData);
      setChartData(formattedData);
    }
  }, [avgData, currentYearData]);

  return (
    <Bar
      data={chartData}
      width={null}
      height={null}
      options={{
        responsive: true,
        aspectRatio: 0.849,
        maintainAspectRatio: false,
        tooltips: {
          mode: "index",
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
        legend: {
          onClick: (e) => e.stopPropagation(),
        },
      }}
    />
  );
};

export default CrashesByYearAverage;
