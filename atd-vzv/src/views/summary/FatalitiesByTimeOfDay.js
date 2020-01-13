import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

import {
  Nav,
  NavItem,
  NavLink,
  Row,
  Col,
  Container
} from "reactstrap";
import classnames from "classnames";
import { Heatmap, HeatmapSeries } from "reaviz";
import { colors } from "../../constants/colors";

const FatalitiesByTimeOfDayWeek = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [dataView, setDataView] = useState(0);

  const thisYear = moment().format("YYYY");
  const lastMonthNumber = moment()
    .subtract(1, "month")
    .format("MM");
  const lastMonthLastDayNumber = moment(
    `${thisYear}-${lastMonthNumber}`,
    "YYYY-MM"
  ).daysInMonth();
  const lastMonthLastDayDate = `${thisYear}-${lastMonthNumber}-${lastMonthLastDayNumber}`;

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

  const getFatalitiesByYearsAgoUrl = () => {
    if (dataView === 0) {
      return `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=death_cnt > 0 AND crash_date between '${thisYear}-01-01T00:00:00' and '${lastMonthLastDayDate}T23:59:59'`;
    } else {
      let yearsAgoDate = moment()
        .subtract(dataView, "year")
        .format("YYYY");
      return `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=death_cnt > 0 AND crash_date between '${yearsAgoDate}-01-01T00:00:00' and '${yearsAgoDate}-12-31T23:59:59'`;
    }
  };

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

  const calculatHourBlockTotals = data => {
    buildDataArray();
    data.data.forEach(record => {
      const date = new Date(record.crash_date);
      const dayOfWeek = date.getDay();
      const time = record.crash_time;
      const timeArray = time.split(":");
      const hour = parseInt(timeArray[0]);
      dataArray[hour].data[dayOfWeek].data++;
    });
    return dataArray;
  };

  useEffect(() => {
    // Fetch records for selected year
    axios.get(getFatalitiesByYearsAgoUrl(dataView)).then(res => {
      setHeatmapData(calculatHourBlockTotals(res));
    });
  }, [dataView]);

  const getYearsAgoLabel = yearsAgo => {
    return moment()
      .subtract(yearsAgo, "year")
      .format("YYYY");
  };

  const [activeTab, setActiveTab] = useState("1");

  const toggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  return (
    <Container>
      <Row>
        <Col md="2"></Col>
        <Col md="8">
          <Nav tabs>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "6" })}
                onClick={() => {
                  toggle("6");
                  setDataView(5);
                }}
              >
                {getYearsAgoLabel(5)}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "5" })}
                onClick={() => {
                  toggle("5");
                  setDataView(4);
                }}
              >
                {getYearsAgoLabel(4)}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "4" })}
                onClick={() => {
                  toggle("4");
                  setDataView(3);
                }}
              >
                {getYearsAgoLabel(3)}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "3" })}
                onClick={() => {
                  toggle("3");
                  setDataView(2);
                }}
              >
                {getYearsAgoLabel(2)}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "2" })}
                onClick={() => {
                  toggle("2");
                  setDataView(1);
                }}
              >
                {getYearsAgoLabel(1)}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "1" })}
                onClick={() => {
                  toggle("1");
                  setDataView(0);
                }}
              >
                {getYearsAgoLabel(0)}
              </NavLink>
            </NavItem>
          </Nav>
        </Col>
        <Col md="2"></Col>
      </Row>
      <Row>
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
      </Row>
    </Container>
  );
};

export default FatalitiesByTimeOfDayWeek;
