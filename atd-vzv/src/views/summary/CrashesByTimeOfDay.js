import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import moment from "moment";
import clonedeep from "lodash.clonedeep";

import CrashTypeSelector from "./Components/CrashTypeSelector";
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
import {
  summaryCurrentYearStartDate,
  summaryCurrentYearEndDate,
  yearsArray,
  dataEndDate,
} from "../../constants/time";
import { crashEndpointUrl } from "./queries/socrataQueries";
import { getYearsAgoLabel } from "./helpers/helpers";
import { colors } from "../../constants/colors";

const CrashesByTimeOfDay = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [crashType, setCrashType] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [maxForLegend, setMaxForLegend] = useState(null);

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const hourBlockArray = useMemo(
    () => [...Array(24).keys()].map((hour) => moment({ hour }).format("hhA")),
    []
  );

  // Look for the elements within this range and hide them on render (then change to extra row of data that will determine weighting)
  // When iterating data, find maximum value and use to set max value for last row that will be hidden
  // Scoot heatmap chart to the right with Col wrapper (Bootstrap class)
  // Set legend with min 0 and max from data https://github.com/reaviz/reaviz/blob/5fd88e8e8c5bd21572b7b21ffe0ec12df2cc8ba5/src/common/legends/SequentialLegend/SequentialLegend.story.tsx#L15
  // #demographics-heatmap > div > svg > g > g:nth-child(170)
  // #demographics-heatmap > div > svg > g > g:nth-child(164)

  useEffect(() => {
    const dayOfWeekArray = moment.weekdaysShort();

    const buildDataArray = () => {
      // This array holds weekday totals for each hour window within a day
      // Reaviz Heatmap expects array of weekday total objs to be reversed in order
      const hourWindowTotalsByDay = dayOfWeekArray
        .map((day) => ({ key: day, data: null })) // Initialize totals as null to unweight 0 in viz
        .reverse();

      // Return array of objs for each hour window that holds totals of each day of the week
      return hourBlockArray.map((hour) => ({
        key: hour,
        data: clonedeep(hourWindowTotalsByDay),
      }));
    };

    const calculateHourBlockTotals = (records) => {
      const dataArray = buildDataArray();

      records.forEach((record) => {
        const recordDateTime = moment(record.crash_date);
        const recordHour = recordDateTime.format("hhA");
        const recordDay = recordDateTime.format("ddd");

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
              parseInt(record.death_cnt) +
              parseInt(record.sus_serious_injry_cnt);
            break;
        }
      });

      return dataArray;
    };

    const getFatalitiesByYearsAgoUrl = () => {
      const yearsAgoDate = moment().subtract(activeTab, "year").format("YYYY");
      let queryUrl =
        activeTab === 0
          ? `${crashEndpointUrl}?$where=${crashType.queryStringCrash} AND crash_date between '${summaryCurrentYearStartDate}T00:00:00' and '${summaryCurrentYearEndDate}T23:59:59'`
          : `${crashEndpointUrl}?$where=${crashType.queryStringCrash} AND crash_date between '${yearsAgoDate}-01-01T00:00:00' and '${yearsAgoDate}-12-31T23:59:59'`;
      return queryUrl;
    };

    // Wait for crashType to be passed up from setCrashType component,
    // then fetch records for selected year
    if (crashType.queryStringCrash) {
      axios.get(getFatalitiesByYearsAgoUrl()).then((res) => {
        const formattedData = calculateHourBlockTotals(res.data);
        setHeatmapData(formattedData);
      });
    }
  }, [activeTab, crashType, hourBlockArray]);

  // Query to find maximum day total per crash type
  useEffect(() => {
    const maxQuery = `
    SELECT date_extract_dow(crash_date) as day, date_extract_hh(crash_date) as hour, date_extract_y(crash_date) as year, SUM(death_cnt) as death, SUM(sus_serious_injry_cnt) as serious, serious + death as all 
    WHERE crash_date BETWEEN '2016-01-01' and '2020-06-30' 
    GROUP BY day, hour, year ORDER BY year 
    |> 
    SELECT max(death) as max_death, max(serious) as max_serious, max(all) as max_all
    `;

    if (!maxForLegend) {
      axios
        .get(crashEndpointUrl + `?$query=` + encodeURIComponent(maxQuery))
        .then((res) => {
          setMaxForLegend(res.data[0]);
        });
    }
  }, [maxForLegend, crashType]);

  const formatValue = (d) => {
    const value = d.data.value ? d.data.value : 0;
    return value;
  };

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
          <CrashTypeSelector setCrashType={setCrashType} />
        </Col>
      </Row>
      <Row>
        <Col>
          <hr />
        </Col>
      </Row>
      <Row className="text-center">
        <Col className="pb-2">
          <StyledButton>
            {yearsArray() // Calculate years ago for each year in data window
              .map((year) => {
                const currentYear = parseInt(dataEndDate.format("YYYY"));
                return currentYear - year;
              })
              .map((yearsAgo) => (
                <Button
                  key={yearsAgo}
                  className={classnames(
                    { active: activeTab === yearsAgo },
                    "year-selector"
                  )}
                  onClick={() => {
                    toggle(yearsAgo);
                  }}
                >
                  {getYearsAgoLabel(yearsAgo)}
                </Button>
              ))}
          </StyledButton>
        </Col>
      </Row>
      <Row className="h-auto">
        <Col id="demographics-heatmap">
          <Heatmap
            height={267}
            data={heatmapData}
            series={
              <HeatmapSeries
                colorScheme={[
                  colors.intensity2Of5,
                  colors.intensity3Of5,
                  colors.intensity4Of5,
                  colors.viridis1Of6Highest,
                ]}
                emptyColor={colors.intensity1Of5Lowest}
                cell={
                  <HeatmapCell
                    tooltip={
                      <ChartTooltip
                        content={(d) =>
                          `${d.x} ∙
                          ${formatValue(d)}`
                        }
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
        </Col>
      </Row>
      <Row>
        <Col className="py-2">
          <SequentialLegend
            data={heatmapData}
            orientation="horizontal"
            colorScheme={[
              colors.intensity2Of5,
              colors.intensity3Of5,
              colors.intensity4Of5,
              colors.viridis1Of6Highest,
            ]}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default CrashesByTimeOfDay;
