import React, { useState, useMemo } from "react";
import { StoreContext } from "../../utils/store";
import moment from "moment";

import { Container, Button } from "reactstrap";
import { HorizontalBar } from "react-chartjs-2";
import { colors } from "../../constants/colors";

export const SideMapTimeOfDayChart = ({ filters }) => {
  const defaultBarColors = [
    colors.info,
    colors.info,
    colors.info,
    colors.info,
    colors.info,
    colors.info
  ];
  const inactiveBarColor = colors.dark;

  const [timeWindowData, setTimeWindowData] = useState([]);
  const [timeWindowPercentages, setTimeWindowPercentages] = useState([]);
  const [barColors, setBarColors] = useState(defaultBarColors);

  const {
    mapData: [mapData],
    mapTimeWindow: [mapTimeWindow, setMapTimeWindow]
  } = React.useContext(StoreContext);

  useMemo(() => {
    const crashes = mapData.features;
    // When mapData is set, accumulate time window data
    // Don't update totals when time window is selected, only update map view
    if (!!crashes && !mapTimeWindow) {
      const crashTimeWindowAccumulatorArray = Object.keys(filters).map(
        filter => 0
      );
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
      }, crashTimeWindowAccumulatorArray);

      setTimeWindowData(crashTimeTotals);
    }
  }, [mapData, filters, mapTimeWindow]);

  useMemo(() => {
    // When timeWindowData is set, calc percentages
    // Don't update percentages when time window is selected, only update map view
    if (!!timeWindowData && !mapTimeWindow) {
      const timeWindowPercentages = timeWindowData.map(timeWindow => {
        const timeWindowsTotal = timeWindowData.reduce(
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

      setTimeWindowPercentages(timeWindowPercentages);
    }
  }, [timeWindowData, mapTimeWindow]);

  const handleBarClick = elems => {
    // Store bar label, if click is within a bar
    const timeWindow = elems.length > 0 ? elems[0]._model.label : null;
    const index = elems.length > 0 ? elems[0]._index : null;

    // If valid click, set mapTimeWindow state
    if (!!timeWindow) {
      const timeWindowArray = filters[timeWindow];
      const timeWindowStart = timeWindowArray[0];
      const timeWindowEnd = timeWindowArray[1];
      const timeWindowFilterString = ` AND date_extract_hh(crash_date) between ${timeWindowStart} and ${timeWindowEnd} AND date_extract_mm(crash_date) between 0 and 59`;
      setMapTimeWindow(timeWindowFilterString);
    }

    // Style unselected bars as inactive
    if (index !== null) {
      const newBarColors = barColors.map((color, i) =>
        i === index ? defaultBarColors[0] : inactiveBarColor
      );
      setBarColors(newBarColors);
    }
  };

  const createTooltipData = (tooltipItem, data) => {
    const index = tooltipItem.index;
    return `${timeWindowPercentages[index]}% (${timeWindowData[index]})`;
  };

  const createChartTimeLabels = () => Object.keys(filters).map(label => label);

  const isMapTimeWindowSet = !!mapTimeWindow;

  const handleAllButtonClick = event => {
    setMapTimeWindow("");
    setBarColors(defaultBarColors);
  };

  const data = {
    labels: createChartTimeLabels(),
    datasets: [
      {
        backgroundColor: barColors,
        borderColor: barColors,
        borderWidth: 1,
        hoverBackgroundColor: colors.infoDark,
        hoverBorderColor: colors.infoDark,
        data: timeWindowPercentages
      }
    ]
  };

  return (
    <Container className="px-0 mt-3">
      {!!timeWindowData && !!timeWindowPercentages && (
        <HorizontalBar
          data={data}
          height={250}
          onElementsClick={handleBarClick}
          options={{
            legend: { display: false },
            scales: {
              xAxes: [
                {
                  ticks: {
                    beginAtZero: true // Keep small %s viewable in chart
                  }
                }
              ]
            },
            tooltips: {
              callbacks: {
                label: createTooltipData,
                title: (tooltipItem, data) => null // Render nothing for tooltip title
              }
            }
          }}
        />
      )}
      <Button
        size="sm"
        color="info"
        outline={isMapTimeWindowSet}
        onClick={handleAllButtonClick}
      >
        All Times
      </Button>
    </Container>
  );
};

export default SideMapTimeOfDayChart;
