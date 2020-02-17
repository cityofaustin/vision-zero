import React, { useState, useMemo } from "react";

import { Container } from "reactstrap";
import { HorizontalBar } from "react-chartjs-2";
import { colors } from "../../constants/colors";

export const SideMapTimeOfDayChart = () => {
  const [timeWindowData, setTimeWindowData] = useState({
    dataPercentages: null,
    data: [50, 50, 50, 50, 50, 50, 50] // TODO: Replace with real data
  });

  useMemo(() => {
    // If data has loaded, create percentages
    if (!!timeWindowData.data) {
      const timeWindowPercentages = timeWindowData.data.map(timeWindow => {
        const timeWindowsTotal = timeWindowData.data.reduce(
          (accumulator, timeWindowTotal) => {
            return (accumulator += timeWindowTotal);
          },
          0
        );
        const percentString = ((timeWindow / timeWindowsTotal) * 100).toFixed(
          0
        );
        return parseInt(percentString);
      });

      const newTimeWindowData = {
        ...timeWindowData,
        dataPercentages: timeWindowPercentages
      };

      setTimeWindowData(newTimeWindowData);
    }
  }, [timeWindowData.data, setTimeWindowData]);

  const calcDataPercentage = (tooltipItem, data) => {
    const index = tooltipItem.index;
    return `${timeWindowData.dataPercentages[index]}% (${timeWindowData.data[index]})`;
  };

  const data = {
    labels: [
      "12AM–4AM",
      "4AM–8AM",
      "4AM–8AM",
      "8AM–12PM",
      "12PM–4PM",
      "4PM–8PM",
      "8PM–12AM"
    ],
    datasets: [
      {
        backgroundColor: colors.info,
        borderColor: colors.info,
        borderWidth: 1,
        hoverBackgroundColor: colors.infoDark,
        hoverBorderColor: colors.infoDark,
        data: !!timeWindowData.dataPercentages && timeWindowData.dataPercentages
      }
    ]
  };

  return (
    <Container className="px-0 mt-3">
      {/* 
      TODO: Update ETL to make crash time queryable
      TODO: Populate with map crash data
      TODO: Populate bar percentages
      TODO: Set onClick handler to filter by time range of bar clicked
      TODO: Create "All" time range button and disable time filters onClick 
      */}
      {!!timeWindowData.dataPercentages && (
        <HorizontalBar
          data={data}
          height={250}
          options={{
            legend: { display: false },
            tooltips: {
              callbacks: {
                label: calcDataPercentage
                // Data Object data
                // Same as line 8 (line 20)
                // tooltipItem Object data
                // xLabel: 80
                // yLabel: "4AM–8AM"
                // label: "4AM–8AM"
                // value: "80"
                // index: 2
                // datasetIndex: 0
                // x: 175.06855456034344
                // y: 63
              },
              title: (tooltipItem, data) => null
              // function(tooltipItem, data) {
              // return data.datasets[tooltipItem[0].datasetIndex].label;
            }
          }}
        />
      )}
    </Container>
  );
};

export default SideMapTimeOfDayChart;
