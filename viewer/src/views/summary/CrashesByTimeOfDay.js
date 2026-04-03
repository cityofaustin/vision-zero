import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";
import clonedeep from "lodash.clonedeep";

import CrashTypeSelector, { CRASH_TYPES } from "./Components/CrashTypeSelector";
import { Row, Col, Container, Button } from "reactstrap";
import styled from "styled-components";
import classnames from "classnames";
import {
  Heatmap,
  HeatmapSeries,
  HeatmapCell,
  ChartTooltip,
  SequentialLegend,
  LinearXAxis,
  LinearXAxisTickSeries,
  LinearXAxisTickLabel,
} from "reaviz";
import { yearsArray } from "../../constants/time";
import { crashEndpointUrl } from "./queries/socrataQueries";
import { colors } from "../../constants/colors";
import ColorSpinner from "../../Components/Spinner/ColorSpinner";

const dayOfWeekArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// format time at 1AM, 12PM, etc
const hourFormat = "ha";

const hourBlockArray = [...Array(24).keys()].map((hour) =>
  format(new Date().setHours(hour), hourFormat)
);

/**
 * Build an array of objs for each hour window that holds totals of each day of the week
 * @returns {Array} Array of objs for each hour window that holds totals of each day of the week
 */
const buildDataArray = () => {
  // This array holds weekday totals for each hour window within a day
  // Reaviz Heatmap expects array of weekday total objs to be reversed in order
  const hourWindowTotalsByDay = dayOfWeekArray
    .map((day) => ({ key: day, data: null })) // Initialize totals as null to unweight 0 in viz
    .reverse();

  return hourBlockArray.map((hour) => ({
    key: hour,
    data: clonedeep(hourWindowTotalsByDay),
  }));
};

/**
 * Container to store fetched data by crash type
 */
const chartDataStore = Object.keys(CRASH_TYPES).reduce((prev, crashType) => {
  prev[crashType] = {};
  return prev;
}, {});

/**
 * Calculate the figures to populate the heatmap cells
 * @param {*} records - Array of crash records returned from the Socrata query
 * @param {Object} crashType - Object containing query and name details (see CrashTypeSelector component)
 * @returns
 */
const calculateHourBlockTotals = (records, crashType) => {
  const dataArray = buildDataArray();
  records.forEach((record) => {
    const recordDateTime = parseISO(record.crash_timestamp_ct);
    const recordHour = format(recordDateTime, hourFormat);
    const recordDay = format(recordDateTime, "E");

    const hourData = dataArray.find((hour) => hour.key === recordHour).data;
    const dayToIncrement = hourData.find((day) => day.key === recordDay);

    switch (crashType.name) {
      case "fatalities":
        dayToIncrement.data += parseInt(record.death_cnt);
        break;
      case "seriousInjuries":
        dayToIncrement.data += parseInt(record.sus_serious_injry_cnt);
        break;
      default:
        dayToIncrement.data +=
          parseInt(record.death_cnt) + parseInt(record.sus_serious_injry_cnt);
        break;
    }
  });

  return dataArray;
};

/**
 * Generate the query url for the Socrata query based on the active tab and crash type
 * @param {Number | "all_years"} activeYear - The active year selected in the cart. Either a year number of "all_years"
 * @param {Object} crashType - Object containing query and name details (see CrashTypeSelector component)
 * @returns {String} The query url for the Socrata query
 */
const getFatalitiesByYearsAgoUrl = (activeYear, crashType) => {
  const queryStartYear =
    activeYear === "all_years" ? yearsArray[0] : activeYear;

  const queryEndYear =
    activeYear === "all_years" ? yearsArray.at(-1) : activeYear;

  let queryUrl = `${crashEndpointUrl}?$where=${crashType.queryStringCrash} AND crash_timestamp_ct between '${queryStartYear}-01-01T00:00:00' and '${queryEndYear}-12-31T23:59:59'`;
  return queryUrl;
};

function getMaxCrashCount(formattedData) {
  let max = 0;
  for (const hour of formattedData) {
    for (const day of hour.data) {
      if (day.data === null) continue;
      if (day.data > max) max = day.data;
    }
  }
  return max;
}

const formatValue = (d) => {
  const value = d.data.value ? d.data.value : 0;
  return value;
};

const CrashesByTimeOfDay = () => {
  const [activeYear, setActiveYear] = useState(yearsArray.at(-1));
  const [crashType, setCrashType] = useState({});
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    if (!crashType.queryStringCrash) return;

    if (!chartDataStore[crashType.name][activeYear]) {
      // we have not fetched this data yet, so do that
      setHeatmapData([]);
      axios
        .get(getFatalitiesByYearsAgoUrl(activeYear, crashType))
        .then((res) => {
          const formattedData = calculateHourBlockTotals(res.data, crashType);
          // save fetched data for re-use
          chartDataStore[crashType.name][activeYear] = formattedData;
          setHeatmapData(formattedData);
        });
    } else {
      // we already fetched this data
      setHeatmapData(chartDataStore[crashType.name][activeYear]);
    }
  }, [activeYear, crashType]);

  const maxForLegend = useMemo(
    () => getMaxCrashCount(heatmapData),
    [heatmapData]
  );

  // Set styles to override Bootstrap default styling
  const StyledButton = styled.div`
    .year-selector {
      color: ${colors.dark};
      background: ${colors.buttonBackground} 0% 0% no-repeat padding-box;
      border-style: none;
      opacity: 1;
      margin-left: 5px;
      margin-right: 5px;
    }
  `;

  return (
    <Container className="m-0 p-0">
      <Row>
        <Col>
          <h2 className="text-left, font-weight-bold">By Time of Day</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <CrashTypeSelector
            setCrashType={setCrashType}
            componentName="CrashesByTimeOfDay"
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <hr />
        </Col>
      </Row>

      <div>
        <Row className="text-center">
          <Col className="pb-2">
            <StyledButton>
              <Button
                key="all_years"
                className={classnames(
                  { active: activeYear === "all_years" },
                  "year-selector"
                )}
                onClick={() => {
                  setActiveYear("all_years");
                }}
              >
                All
              </Button>
              {yearsArray // Calculate years ago for each year in data window
                .map((year) => (
                  <Button
                    key={year}
                    className={classnames(
                      { active: activeYear === year },
                      "year-selector"
                    )}
                    onClick={() => {
                      setActiveYear(year);
                    }}
                  >
                    {year}
                  </Button>
                ))}
            </StyledButton>
          </Col>
        </Row>
        <Row className="h-auto">
          <Col id="demographics-heatmap">
            {!!heatmapData.length > 0 ? (
              <Heatmap
                height={267}
                margins={[0, 0, 0, 15]}
                data={heatmapData}
                series={
                  <HeatmapSeries
                    colorScheme={[
                      colors.intensity1Of7,
                      colors.intensity2Of7,
                      colors.intensity3Of7,
                      colors.intensity4Of7,
                      colors.intensity5Of7,
                      colors.intensity6Of7,
                      colors.intensity7Of7,
                    ]}
                    emptyColor={colors.intensity0Of7}
                    cell={
                      <HeatmapCell
                        tooltip={
                          <ChartTooltip
                            content={(d) => (
                              <div
                                // attempt to match react-charts tooltip style
                                style={{
                                  backgroundColor: "rgba(10, 10, 10, 0.8)",
                                  color: "#fff",
                                  padding: 5,
                                  borderRadius: 5,
                                }}
                              >
                                <span className="font-weight-bold">{`${d.x}`}</span>
                                <div>
                                  <span>{`${formatValue(d)} crash${!d.y || d.y > 1 ? "es" : ""}`}</span>
                                </div>
                              </div>
                            )}
                          />
                        }
                      />
                    }
                  />
                }
                xAxis={
                  <LinearXAxis
                    type="category"
                    axisLine={null}
                    tickSeries={
                      <LinearXAxisTickSeries
                        line={null}
                        label={
                          <LinearXAxisTickLabel
                            padding={
                              navigator.userAgent.includes("Firefox") ? 15 : 5
                            }
                          />
                        }
                      />
                    }
                  />
                }
              />
            ) : (
              <h1>
                <ColorSpinner />
              </h1>
            )}
          </Col>
        </Row>
        <Row>
          <Col className="py-2">
            {!!maxForLegend && (
              <SequentialLegend
                data={[
                  { key: "Max", data: maxForLegend },
                  { key: "Min", data: 0 },
                ]}
                orientation="horizontal"
                colorScheme={[colors.intensity1Of7, colors.intensity6Of7]}
              />
            )}
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default CrashesByTimeOfDay;
