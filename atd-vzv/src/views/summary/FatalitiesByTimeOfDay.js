import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

import CrashTypeSelector from "../nav/CrashTypeSelector";
import { Nav, NavItem, NavLink, Row, Col, Container } from "reactstrap";
import classnames from "classnames";
import { Heatmap, HeatmapSeries } from "reaviz";
import {
  summaryCurrentYearStartDate,
  summaryCurrentYearEndDate
} from "../../constants/time";
import { getYearsAgoLabel } from "./helpers/helpers";
import { colors } from "../../constants/colors";

const FatalitiesByTimeOfDayWeek = () => {
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
          ? `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=${crashType.queryStringCrash} AND crash_date between '${summaryCurrentYearStartDate}T00:00:00' and '${summaryCurrentYearEndDate}T23:59:59'`
          : `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=${crashType.queryStringCrash} AND crash_date between '${yearsAgoDate}-01-01T00:00:00' and '${yearsAgoDate}-12-31T23:59:59'`;
      return queryUrl;
    };

    // Wait for crashType to be passed up from setCrashType component,
    // then fetch records for selected year
    if (crashType.queryStringCrash)
      axios.get(getFatalitiesByYearsAgoUrl()).then(res => {
        setHeatmapData(calculateHourBlockTotals(res));
      });
  }, [activeTab, crashType]);

  return (
    <Container>
      <Row style={{ paddingBottom: "0.75em" }}>
        <Col>
          <h3 style={{ textAlign: "center" }}>
            {crashType.textString} by Time of Day
          </h3>
        </Col>
      </Row>
      <Row>
        <Col>
          <Nav tabs className="justify-content-center">
            {[4, 3, 2, 1, 0].map(yearsAgo => (
              <NavItem key={yearsAgo}>
                <NavLink
                  key={yearsAgo}
                  className={classnames({ active: activeTab === yearsAgo })}
                  onClick={() => {
                    toggle(yearsAgo);
                  }}
                >
                  {getYearsAgoLabel(yearsAgo)}
                </NavLink>
              </NavItem>
            ))}
          </Nav>
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
                  colors.redGradient1Of5,
                  colors.redGradient2Of5,
                  colors.redGradient3Of5,
                  colors.redGradient4Of5,
                  colors.redGradient5Of5
                ]}
              />
            }
          />
        </Col>
      </Row>
      <Row style={{ paddingTop: "0.75em" }}>
        <Col>
          <CrashTypeSelector setCrashType={setCrashType} />
        </Col>
      </Row>
    </Container>
  );
};

export default FatalitiesByTimeOfDayWeek;
