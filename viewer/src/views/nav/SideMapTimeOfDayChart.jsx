import React, { useState, useMemo, useEffect, useRef } from "react";
import { StoreContext } from "src/constants/context";
import axios from "axios";
import { format } from "date-fns";
import { createMapDataUrl } from "../map/helpers";
import { crashEndpointUrl } from "../summary/queries/socrataQueries";

import { Container, Button } from "reactstrap";
import { Bar, getElementAtEvent } from "react-chartjs-2";
import { colors } from "../../constants/colors";

export const SideMapTimeOfDayChart = ({ filters }) => {
  const chartRef = useRef();

  const defaultBarColor = colors.dark;
  const inactiveBarColor = colors.white;

  const [chartData, setChartData] = useState(null);
  const [barColors, setBarColors] = useState(
    Object.keys(filters).map(() => defaultBarColor),
  );

  const {
    mapTimeWindow: [mapTimeWindow, setMapTimeWindow],
    mapFilters: [mapFilters],
    mapDateRange: dateRange,
    mapPolygon: [mapPolygon],
  } = React.useContext(StoreContext);

  // Get crash data without mapTimeWindow filter to populate chart
  useEffect(() => {
    const apiUrl = createMapDataUrl(
      crashEndpointUrl,
      mapFilters,
      dateRange,
      mapPolygon,
    );
    if (apiUrl) {
      axios.get(apiUrl).then((res) => {
        setChartData(res.data);
      });
    }
  }, [dateRange, mapPolygon, mapFilters]);

  // Compute time window data from crash data
  // Returns array of crash counts per time window
  const timeWindowData = useMemo(() => {
    const crashes = chartData;
    if (!crashes || crashes.length === 0) {
      return [];
    }

    const crashTimeWindowAccumulatorArray = new Array(
      Object.keys(filters).length,
    ).fill(0);
    const crashTimeWindows = Object.values(filters).map((filter) => filter);

    return crashes.reduce((accumulator, crash) => {
      crashTimeWindows.forEach((timeWindow, i) => {
        const crashDate = crash.crash_timestamp_ct;
        const crashHour = parseInt(format(new Date(crashDate), "H"));
        if (crashHour >= timeWindow[0] && crashHour <= timeWindow[1]) {
          accumulator[i]++;
        }
      });
      return accumulator;
    }, crashTimeWindowAccumulatorArray);
  }, [chartData, filters]);

  // Compute percentage distribution from time window counts
  // Returns array of percentages for each time window

  const timeWindowPercentages = useMemo(() => {
    if (!timeWindowData || timeWindowData.length === 0) {
      return [];
    }

    const timeWindowsTotal = timeWindowData.reduce(
      (accumulator, timeWindowTotal) => accumulator + timeWindowTotal,
      0,
    );

    if (timeWindowsTotal === 0) {
      return timeWindowData.map(() => 0);
    }

    return timeWindowData.map((timeWindow) => {
      return parseInt(((timeWindow / timeWindowsTotal) * 100).toFixed(0));
    });
  }, [timeWindowData]);

  const handleBarClick = (event) => {
    if (chartRef.current) {
      const elements = getElementAtEvent(chartRef.current, event);

      if (elements && elements.length > 0) {
        const element = elements[0];
        const index = element.index;
        const timeLabel = Object.keys(filters)[index];
        const timeWindow = filters[timeLabel];

        // If valid click, set mapTimeWindow state
        if (timeWindow) {
          const timeWindowStart = timeWindow[0];
          const timeWindowEnd = timeWindow[1];
          const timeWindowFilterString = ` AND date_extract_hh(crash_timestamp_ct) between ${timeWindowStart} and ${timeWindowEnd} AND date_extract_mm(crash_timestamp_ct) between 0 and 59`;
          setMapTimeWindow(timeWindowFilterString);
        }

        // Style unselected bars as inactive
        if (index !== null) {
          const newBarColors = Object.keys(filters).map((filter, i) =>
            i === index ? defaultBarColor : inactiveBarColor,
          );
          setBarColors(newBarColors);
        }
      }
    }
  };

  const createTooltipData = (tooltipItem) => {
    const index = tooltipItem.index;
    return `${timeWindowPercentages[index]}% (${timeWindowData[index]})`;
  };

  const createChartTimeLabels = () =>
    Object.keys(filters).map((label) => label);

  const isMapTimeWindowSet = !!mapTimeWindow;

  const handleAllButtonClick = () => {
    setMapTimeWindow("");
    setBarColors(Object.keys(filters).map(() => defaultBarColor));
  };

  const handleHover = (event, elements) => {
    if (elements && elements.length > 0) {
      event.native.target.style.cursor = "pointer";
    } else {
      event.native.target.style.cursor = "default";
    }
  };

  const data = {
    labels: createChartTimeLabels(),
    datasets: [
      {
        label: "time-of-day",
        backgroundColor: barColors,
        borderColor: defaultBarColor,
        borderWidth: 1,
        hoverBackgroundColor: colors.secondary,
        hoverBorderColor: colors.secondary,
        data: timeWindowPercentages,
      },
    ],
  };

  return (
    <Container className="px-0 mt-3">
      {!!timeWindowData && !!timeWindowPercentages && (
        <Bar
          ref={(ref) => (chartRef.current = ref)}
          data={data}
          height={250}
          aria-label="Horizontal bar chart showing crash distribution by time of day. Click any bar to filter the map to that time range"
          onClick={handleBarClick}
          options={{
            indexAxis: "y",
            onHover: handleHover,
            scales: {
              x: {
                ticks: {
                  beginAtZero: true, // Keep small %s viewable in chart
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const index = context.dataIndex;
                    return `${timeWindowPercentages[index]}% (${timeWindowData[index]})`;
                  },
                  title: function () {
                    return null; // Render nothing for tooltip title
                  },
                },
              },
            },
          }}
        />
      )}
      <Button
        size="sm"
        color="dark"
        active={!isMapTimeWindowSet}
        outline={isMapTimeWindowSet}
        onClick={handleAllButtonClick}
      >
        All Times
      </Button>
    </Container>
  );
};

export default SideMapTimeOfDayChart;
