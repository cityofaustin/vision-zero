import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

import { Container, Row, Col } from "reactstrap";
import { Heatmap } from "reaviz";

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

  const getYearsAgoLabel = yearsAgo => {
    return moment()
      .subtract(yearsAgo, "year")
      .format("YYYY");
  };

  useEffect(() => {
    // Fetch records for selected year
    axios.get(getFatalitiesByYearsAgoUrl(dataView)).then(res => {
      setHeatmapData(calculatHourBlockTotals(res));
    });
    console.log(getFatalitiesByYearsAgoUrl(dataView));
  }, [dataView]);

  return (
    <Container>
      <Row>
        <Col md="12">
          <Heatmap height={200} width={450} data={heatmapData} />
        </Col>
      </Row>
      <Row>
        <Col md="2">
          <h3 onClick={() => setDataView(5)}>{getYearsAgoLabel(5)}</h3>
        </Col>
        <Col md="2">
          <h3 onClick={() => setDataView(4)}>{getYearsAgoLabel(4)}</h3>
        </Col>
        <Col md="2">
          <h3 onClick={() => setDataView(3)}>{getYearsAgoLabel(3)}</h3>
        </Col>
        <Col md="2">
          <h3 onClick={() => setDataView(2)}>{getYearsAgoLabel(2)}</h3>
        </Col>
        <Col md="2">
          <h3 onClick={() => setDataView(1)}>{getYearsAgoLabel(1)}</h3>
        </Col>
        <Col md="2">
          <h3 onClick={() => setDataView(0)}>{getYearsAgoLabel(0)}</h3>
        </Col>
      </Row>
    </Container>
  );
};

export default FatalitiesByTimeOfDayWeek;
