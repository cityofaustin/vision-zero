import React, { useState, useMemo } from "react";
import { StoreContext } from "../../utils/store";
import moment from "moment";

import { Container } from "reactstrap";
import { HorizontalBar } from "react-chartjs-2";
import { colors } from "../../constants/colors";

export const SideMapTimeOfDayChart = ({ filters }) => {
  const [timeWindowData, setTimeWindowData] = useState({
    dataPercentages: null,
    data: []
  });

  const {
    mapDateRange: [dateRange],
    mapData: [mapData]
  } = React.useContext(StoreContext);

  useMemo(() => {
    // When mapData is set, accumulate time window data
    const crashes = mapData.features;
    if (!!crashes) {
      const crashTimeWindowTotals = Object.keys(filters).map(filter => 0);
      const crashTimeWindows = Object.values(filters).map(filter => filter);
      const crashTimeTotals = crashes.reduce((accumulator, crash) => {
        crashTimeWindows.forEach((timeWindow, i) => {
          const crashDate = crash.properties.crash_date;
          const crashHour = parseInt(moment(crashDate).format("HH"));
          crashHour >= timeWindow[0] &&
            crashHour <= timeWindow[1] &&
            accumulator[i]++;
        });
        return accumulator;
      }, crashTimeWindowTotals);

      const newTimeWindowData = {
        ...timeWindowData,
        data: crashTimeTotals
      };

      setTimeWindowData(newTimeWindowData);
    }
  }, [mapData]);

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

  const createTimeLabels = () => Object.keys(filters).map(label => label);

  const data = {
    labels: createTimeLabels(),
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
      TODO: Set onClick handler to filter by time range of bar clicked, https://dev.socrata.com/docs/functions/date_extract_hh.html
      https://data.austintexas.gov/resource/3aut-fhzp.json?$where=date_extract_hh(crash_date) between 16 and 17 AND date_extract_mm(crash_date) between 0 and 59
      TODO: Create "All" time range button and disable time filters onClick, clears date extract filters, active when no date extract filters
      TODO: Only update percentages if there is no time window filter set
      */}
      {!!timeWindowData.dataPercentages && (
        <HorizontalBar
          data={data}
          height={250}
          onElementsClick={elems => {
            console.log(elems);
            // elem[0]._model.label or elem[0]._model.datasetLabel
            console.log(moment("11:28:00", "h:mm:ss").format("ha"));
          }}
          options={{
            legend: { display: false },
            scales: {
              xAxes: [
                {
                  ticks: {
                    beginAtZero: true
                  }
                }
              ]
              // onClick: (e, item) => {
              //   console.log(item);
            },
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
          // onClick: (e, item) => {
          //   console.log(item);
          // }
        />
      )}
    </Container>
  );
};

export default SideMapTimeOfDayChart;
