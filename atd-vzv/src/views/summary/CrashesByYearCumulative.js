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

      const reduceCumulativeTotals = (data, valueKey) =>
        data.reduce((acc, data, i) => {
          const num = parseFloat(data[valueKey]);
          const roundNum = (num) => Math.floor(num * 100) / 100;

          i === 0 && acc.push(roundNum(num));
          i !== 0 && acc.push(roundNum(acc[i - 1] + num));
          return acc;
        }, []);

      const avgValues = reduceCumulativeTotals(avgData, "avg");
      const currentValues = reduceCumulativeTotals(currentYearData, "total");

      const formatDataset = (dataArr, label, color) => ({
        label: label,
        fill: false,
        lineTension: 0.1,
        backgroundColor: color,
        borderColor: color,
        borderCapStyle: "butt",
        borderJoinStyle: "miter",
        borderWidth: 3.5,
        pointBorderColor: color,
        pointBackgroundColor: color,
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: color,
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: dataArr,
      });

      return {
        labels,
        datasets: [
          formatDataset(avgValues, "Five Year Average", colors.viridis3Of6),
          formatDataset(
            currentValues,
            "Current Year",
            colors.viridis1Of6Highest
          ),
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
    <Line
      data={chartData}
      height={null}
      width={null}
      options={{
        responsive: true,
        aspectRatio: 0.849,
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
        legend: {
          onClick: (e) => e.stopPropagation(),
        },
      }}
    />
  );
};

export default CrashesByYearCumulative;
