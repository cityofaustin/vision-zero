import React, { useState, useMemo, useEffect, useRef } from "react";
import { StoreContext } from "../../utils/store";
import axios from "axios";
import { format } from "date-fns";
import { createMapDataUrl } from "../map/helpers";
import { crashEndpointUrl } from "../summary/queries/socrataQueries";

import { Container, Button } from "reactstrap";
import { HorizontalBar } from "react-chartjs-2";
import { colors } from "../../constants/colors";

const fieldsToRequest = [
  "death_cnt",
  "sus_serious_injry_cnt",
  "crash_id",
  "crash_date",
];

export const SideMapTimeOfDayChart = ({ filters }) => {
  const chartRef = useRef();

  const defaultBarColor = colors.dark;
  const inactiveBarColor = colors.white;

  const [crashes, setCrashes] = useState(null);
  const [timeWindowData, setTimeWindowData] = useState([]);
  const [timeWindowPercentages, setTimeWindowPercentages] = useState([]);
  const [barColors, setBarColors] = useState(defaultBarColor);

  const {
    mapTimeWindow: [mapTimeWindow, setMapTimeWindow],
    mapFilters: [mapFilters],
    mapDateRange: dateRange,
    mapPolygon: [mapPolygon],
  } = React.useContext(StoreContext);

  // mapFilters with ALL selected and only Other checked
  //   {
  //     "icon": {
  //         "prefix": "fas",
  //         "iconName": "ellipsis-h",
  //         "icon": [
  //             512,
  //             512,
  //             [],
  //             "f141",
  //             "M328 256c0 39.8-32.2 72-72 72s-72-32.2-72-72 32.2-72 72-72 72 32.2 72 72zm104-72c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72zm-352 0c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72z"
  //         ]
  //     },
  //     "fatalSyntax": "other_death_count > 0",
  //     "injurySyntax": "other_serious_injury_count > 0",
  //     "type": "where",
  //     "operator": "OR",
  //     "default": true,
  //     "name": "other",
  //     "group": "mode",
  //     "syntax": "other_death_count > 0 OR other_serious_injury_count > 0"
  // }
  //
  // Fires three requests to the crash open dataset (y2wy-tgr5):
  // https://data.austintexas.gov/resource/y2wy-tgr5.json?
  // $select=point,death_cnt,sus_serious_injry_cnt,latitude,longitude,crash_id,units_involved,crash_date
  // &$limit=100000&$where=crash_date between '2020-01-01T00:00:00' and '2024-03-18T23:59:59'
  // AND (other_death_count > 0 OR other_serious_injury_count > 0)
  // AND

  // Get crash data without mapTimeWindow filter to populate chart
  useEffect(() => {
    const apiUrl = createMapDataUrl(
      crashEndpointUrl,
      mapFilters,
      dateRange,
      mapPolygon,
      fieldsToRequest
    );

    !!apiUrl &&
      axios.get(apiUrl).then((res) => {
        setCrashes(res.data);
      });
  }, [dateRange, mapPolygon, mapFilters]);

  useMemo(() => {
    // When chartData is set, accumulate time window data
    if (!!crashes) {
      // Fill in time window data with 0s
      const crashTimeWindowAccumulatorArray = Object.keys(filters).map(() => 0);
      const crashTimeWindows = Object.values(filters).map((filter) => filter);
      const crashTimeTotals = crashes.reduce((accumulator, crash) => {
        crashTimeWindows.forEach((timeWindow, i) => {
          const crashDate = crash.crash_date;
          const crashHour = parseInt(format(new Date(crashDate), "H"));

          const crashFatalities = parseInt(crash.death_cnt);
          const seriousInjuries = parseInt(crash.sus_serious_injry_cnt);
          const isCrashInTimeWindow =
            crashHour >= timeWindow[0] && crashHour <= timeWindow[1];

          if (isCrashInTimeWindow) {
            accumulator[i] = accumulator[i] + crashFatalities + seriousInjuries;
          }
        });
        return accumulator;
      }, crashTimeWindowAccumulatorArray);

      setTimeWindowData(crashTimeTotals);
    }
  }, [crashes, filters]);

  useMemo(() => {
    // When timeWindowData is set, calc percentages
    if (!!timeWindowData) {
      const timeWindowPercentages = timeWindowData.map((timeWindow) => {
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
  }, [timeWindowData]);

  const handleBarClick = (elems) => {
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
      const newBarColors = Object.keys(filters).map((filter, i) =>
        i === index ? defaultBarColor : inactiveBarColor
      );
      setBarColors(newBarColors);
    }
  };

  const createTooltipData = (tooltipItem, data) => {
    const index = tooltipItem.index;
    return `${timeWindowPercentages[index]}% (${timeWindowData[index]})`;
  };

  const createChartTimeLabels = () =>
    Object.keys(filters).map((label) => label);

  const isMapTimeWindowSet = !!mapTimeWindow;

  const handleAllButtonClick = (event) => {
    setMapTimeWindow("");
    setBarColors(defaultBarColor);
  };

  const handleHover = (evt) => {
    var item = chartRef.current.chartInstance.getElementAtEvent(evt);
    if (item.length) {
      // Change cursor if hovering over a data bar
      evt.target.style.cursor = item[0]._model.datasetLabel && "pointer";
    } else {
      evt.target.style.cursor = "default";
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
        <HorizontalBar
          ref={(ref) => (chartRef.current = ref)}
          data={data}
          height={250}
          onElementsClick={handleBarClick}
          options={{
            onHover: handleHover,
            legend: {
              display: false,
            },
            scales: {
              xAxes: [
                {
                  ticks: {
                    beginAtZero: true, // Keep small %s viewable in chart
                  },
                },
              ],
            },
            tooltips: {
              callbacks: {
                label: createTooltipData,
                title: (tooltipItem, data) => null, // Render nothing for tooltip title
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
