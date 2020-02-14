import React from "react";

import { Container } from "reactstrap";
import { HorizontalBar } from "react-chartjs-2";
import { colors } from "../../constants/colors";

export const SideMapTimeOfDayChart = () => {
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
        data: [65, 59, 80, 81, 56, 55, 70]
      }
    ]
  };

  return (
    <Container className="px-0 mt-3">
      {/* 
      TODO: Update ETL to make crash time queryable
      TODO: Heighten horizontal bars
      TODO: Populate with map crash data
      TODO: Populate bar percentages
      TODO: Set onClick handler to filter by time range of bar clicked
      TODO: Create "All" time range button and disable time filters onClick 
      */}
      <HorizontalBar data={data} options={{ legend: { display: false } }} />
    </Container>
  );
};

export default SideMapTimeOfDayChart;
