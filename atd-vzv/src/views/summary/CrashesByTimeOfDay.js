import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import clonedeep from "lodash.clonedeep";

import CrashTypeSelector from "../nav/CrashTypeSelector";
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
  yearsArray,
  dataEndDate,
} from "../../constants/time";

import { getYearsAgoLabel } from "./helpers/helpers";
import { colors } from "../../constants/colors";

const CrashesByTimeOfDay = (props) => {
  const [activeTab, setActiveTab] = useState(0);
  const [crashType, setCrashType] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const hourBlockArray = useMemo(
    () => [...Array(24).keys()].map((hour) => moment({ hour }).format("hhA")),
    []
  );

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

  const activeTabToYear = (tab) => {
    return moment().subtract(tab, "year").format("YYYY");
  }

  const dowMap = {
    "Sat": 0,
    "Fri": 1,
    "Thu": 2,
    "Wed": 3,
    "Tue": 4,
    "Mon": 5,
    "Sun": 6,
  };

  const dowToNum = (dow) => {
    return dowMap[dow];
  }

  useEffect(() => {
    const currentYear = activeTabToYear(activeTab);

    const currentValueByMode = (mode, node) => {

      switch (mode) {
        case "fatalities":
        {
          return node.death_cnt;
        }
          break;
        case "seriousInjuries":
        {
          return node.sus_serious_injry_cnt;
        }
          break;
        default: {
          return (
            node.death_cnt + node.sus_serious_injry_cnt
          );
        }
      }
    };

    console.log("crashType", crashType);
    console.log("activeTab", activeTab);
    console.log("heatmapData", heatmapData);
    console.log("currentYear", currentYear);

    const newData = props.data.filter(dayHourNode => {
      return String(dayHourNode.year) === String(currentYear);
    }).reduce((acc, currentNode, i) => {
      const nodeHour = parseInt(currentNode.hour);
      if(i === 1) {
        const originalAcc = {...acc};
        acc = buildDataArray();

        acc[nodeHour]["data"][dowToNum(currentNode.dow)]["data"] = 0;
        acc[nodeHour]["data"][dowToNum(currentNode.dow)]["data"] +=
          currentValueByMode(crashType.name, originalAcc);
      }

      acc[nodeHour]["data"][dowToNum(currentNode.dow)]["data"] +=
        currentValueByMode(crashType.name, currentNode);

      if (acc[nodeHour]["data"][dowToNum(currentNode.dow)]["data"] === 0){
        acc[nodeHour]["data"][dowToNum(currentNode.dow)]["data"] = null;
      }
      return acc;
    });

    setHeatmapData(newData);
  }, [activeTab, crashType]);

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
        <Col>
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
