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
      TODO: Populate with map crash data
      TODO: Populate bar percentages
      TODO: Set onClick handler to filter by time range of bar clicked
      TODO: Create "All" time range button and disable time filters onClick 
      */}
      <HorizontalBar data={data} height="250px" options={{ legend: { display: false }, tooltips: {
  callbacks: {
    label: (tooltipItem, data) => console.log(tooltipItem, data)
      // function(tooltipItem, data) {
      // var index = tooltipItem.index;
      // var currentValue = data.datasets[tooltipItem.datasetIndex].data[index];
      // var total = 0;
      // data.datasets.forEach(function(el){
      //   total = total + el.data[index];
      // });
      // var percentage = parseFloat((currentValue/total*100).toFixed(1));
      // return currentValue + ' (' + percentage + '%)';
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
    title: (tooltipItem, data) => "Title"
      // function(tooltipItem, data) {
      // return data.datasets[tooltipItem[0].datasetIndex].label;
    }
  }
} />
    </Container>
  );
};

export default SideMapTimeOfDayChart;
