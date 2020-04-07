import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

import CrashTypeSelector from "../nav/CrashTypeSelector";
import { Row, Col, Container, Button } from "reactstrap";
import styled from "styled-components";
import classnames from "classnames";
import { Heatmap, HeatmapSeries } from "reaviz";
import {
  summaryCurrentYearStartDate,
  summaryCurrentYearEndDate,
  yearsArray,
  dataEndDate
} from "../../constants/time";
import { crashEndpointUrl } from "./queries/socrataQueries";
import { getYearsAgoLabel } from "./helpers/helpers";
import { colors } from "../../constants/colors";

const CrashesByTimeOfDay = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [crashType, setCrashType] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);

  const toggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  useEffect(() => {
    const dayOfWeekArray = moment.weekdays();
    const hourBlockArray = [
      "12AM",
      "01AM",
      "02AM",
      "03AM",
      "04AM",
      "05AM",
      "06AM",
      "07AM",
      "08AM",
      "09AM",
      "10AM",
      "11AM",
      "12PM",
      "01PM",
      "02PM",
      "03PM",
      "04PM",
      "05PM",
      "06PM",
      "07PM",
      "08PM",
      "09PM",
      "10PM",
      "11PM"
    ];

    let dataArray = [];

    const buildDataArray = () => {
      dataArray = [];
      hourBlockArray.forEach(hour => {
        let hourObject = {
          key: hour,
          data: []
        };
        dayOfWeekArray.forEach(day => {
          let dayObject = {
            key: day,
            data: 0
          };
          hourObject.data.push(dayObject);
        });
        hourObject.data.reverse();
        dataArray.push(hourObject);
      });
    };

    const calculateHourBlockTotals = data => {
      buildDataArray();
      data.data.forEach(record => {
        const date = new Date(record.crash_date);
        const dayOfWeek = date.getDay();
        const time = record.crash_time;
        const timeArray = time.split(":");
        const hour = parseInt(timeArray[0]);
        switch (crashType.name) {
          case "fatalities":
            dataArray[hour].data[dayOfWeek].data += parseInt(record.death_cnt);
            break;
          case "seriousInjuries":
            dataArray[hour].data[dayOfWeek].data += parseInt(
              record.sus_serious_injry_cnt
            );
            break;
          default:
            dataArray[hour].data[dayOfWeek].data +=
              parseInt(record.death_cnt) +
              parseInt(record.sus_serious_injry_cnt);
            break;
        }
      });
      return dataArray;
    };

    const getFatalitiesByYearsAgoUrl = () => {
      const yearsAgoDate = moment()
        .subtract(activeTab, "year")
        .format("YYYY");
      let queryUrl =
        activeTab === 0
          ? `${crashEndpointUrl}?$where=${crashType.queryStringCrash} AND crash_date between '${summaryCurrentYearStartDate}T00:00:00' and '${summaryCurrentYearEndDate}T23:59:59'`
          : `${crashEndpointUrl}?$where=${crashType.queryStringCrash} AND crash_date between '${yearsAgoDate}-01-01T00:00:00' and '${yearsAgoDate}-12-31T23:59:59'`;
      return queryUrl;
    };

    // Wait for crashType to be passed up from setCrashType component,
    // then fetch records for selected year
    if (crashType.queryStringCrash)
      axios.get(getFatalitiesByYearsAgoUrl()).then(res => {
        setHeatmapData(calculateHourBlockTotals(res));
      });
  }, [activeTab, crashType]);

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
    <Container>
      <Row>
        <Col>
          <h1 className="text-left, font-weight-bold">By Time of Day</h1>
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
              .map(year => {
                const currentYear = parseInt(dataEndDate.format("YYYY"));
                return currentYear - year;
              })
              .map(yearsAgo => (
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
      <Row>
        <Col>
          <Heatmap
            height={200}
            data={heatmapData}
            series={
              <HeatmapSeries
                colorScheme={[
                  colors.intensity1Of5Lowest,
                  colors.intensity2Of5,
                  colors.intensity3Of5,
                  colors.intensity4Of5,
                  colors.intensity5Of5Highest
                ]}
              />
            }
          />
        </Col>
      </Row>
    </Container>
  );
};

export default CrashesByTimeOfDay;
