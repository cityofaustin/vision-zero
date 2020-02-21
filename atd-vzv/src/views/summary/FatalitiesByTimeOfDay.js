import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

import CrashTypeSelector from "../nav/CrashTypeSelector";
import { Nav, NavItem, NavLink, Row, Col, Container } from "reactstrap";
import classnames from "classnames";
import { Heatmap, HeatmapSeries } from "reaviz";
import {
  thisMonth,
  thisYear,
  lastMonth,
  lastDayOfLastMonth
} from "../../constants/time";
import { colors } from "../../constants/colors";

const FatalitiesByTimeOfDayWeek = () => {
  // Check current month before setting the active tab.
  // If current month is January, display last year's data,
  // if past January, display this year's data.
  const checkMonth = () => {
    if (thisMonth > "01") {
      return 0;
    } else {
      return 1;
    }
  };

  const [activeTabYear, setActiveTabYear] = useState(checkMonth());
  const [crashType, setCrashType] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);

  const getYearsAgoLabel = yearsAgo => {
    return moment()
      .subtract(yearsAgo, "year")
      .format("YYYY");
  };

  const toggleYear = tabYear => {
    if (activeTabYear !== tabYear) {
      setActiveTabYear(tabYear);
    }
  };

  useEffect(() => {
    const dayOfWeekArray = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];
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
        .subtract(activeTabYear, "year")
        .format("YYYY");
      let queryUrl =
        activeTabYear === 0
          ? `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=${crashType.queryStringCrash} AND crash_date between '${thisYear}-01-01T00:00:00' and '${thisYear}-${lastMonth}-${lastDayOfLastMonth}T23:59:59'`
          : `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=${crashType.queryStringCrash} AND crash_date between '${yearsAgoDate}-01-01T00:00:00' and '${yearsAgoDate}-12-31T23:59:59'`;
      return queryUrl;
    };

    // Wait for crashType to be passed up from setCrashType component,
    // then fetch records for selected year
    if (crashType.queryStringCrash)
      axios.get(getFatalitiesByYearsAgoUrl()).then(res => {
        setHeatmapData(calculateHourBlockTotals(res));
      });
  }, [activeTabYear, crashType]);

  return (
    <Container>
      <Row className="pb-3">
        <Col>
        <h3 className="text-center">
            {crashType.textString} by Time of Day
          </h3>
        </Col>
      </Row>
      <Row>
        <Col>
          <Nav tabs className="justify-content-center">
            <NavItem>
              <NavLink
                className={classnames({ active: activeTabYear === 5 })}
                onClick={() => {
                  toggleYear(5);
                }}
              >
                {getYearsAgoLabel(5)}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTabYear === 4 })}
                onClick={() => {
                  toggleYear(4);
                }}
              >
                {getYearsAgoLabel(4)}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTabYear === 3 })}
                onClick={() => {
                  toggleYear(3);
                }}
              >
                {getYearsAgoLabel(3)}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTabYear === 2 })}
                onClick={() => {
                  toggleYear(2);
                }}
              >
                {getYearsAgoLabel(2)}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTabYear === 1 })}
                onClick={() => {
                  toggleYear(1);
                }}
              >
                {getYearsAgoLabel(1)}
              </NavLink>
            </NavItem>
            {thisMonth > "01" && (
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTabYear === 0 })}
                  onClick={() => {
                    toggleYear(0);
                  }}
                >
                  {getYearsAgoLabel(0)}
                </NavLink>
              </NavItem>
            )}
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
      <Row className="pt-3">
        <Col>
          <CrashTypeSelector setCrashType={setCrashType} />
        </Col>
      </Row>
    </Container>
  );
};

export default FatalitiesByTimeOfDayWeek;
