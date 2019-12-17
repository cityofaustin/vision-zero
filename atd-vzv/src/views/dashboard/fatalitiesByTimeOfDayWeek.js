import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

import { Container, Row, Col } from "reactstrap";
import { Heatmap } from "reaviz";

const FatalitiesByTimeOfDayWeek = () => {
  const thisYear = moment().format("YYYY");
  const lastMonthNumber = moment()
    .subtract(1, "month")
    .format("MM");
  const lastMonthLastDayNumber = moment(
    `${thisYear}-${lastMonthNumber}`,
    "YYYY-MM"
  ).daysInMonth();
  const lastMonthLastDayDate = `${thisYear}-${lastMonthNumber}-${lastMonthLastDayNumber}`;
//   const lastMonthString = moment()
//     .subtract(1, "month")
//     .format("MMMM");

  const thisYearUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=death_cnt > 0 AND crash_date between '${thisYear}-01-01T00:00:00' and '${lastMonthLastDayDate}T23:59:59'`;

  const [thisYearDeathArray, setThisYearDeathArray] = useState([]);

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
  const dataArray = [];

  const buildDataArray = () => {
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

  const calculatHourBlockTotals = (data) => {
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
    // Fetch records from this year through last month
    axios.get(thisYearUrl).then(res => {
      setThisYearDeathArray(calculatHourBlockTotals(res, lastMonthLastDayDate));
    });
  }, [thisYearUrl, lastMonthLastDayDate]);

  console.log(thisYearDeathArray);

  return (
    <Container>
      <Heatmap height={350} width={350} data={thisYearDeathArray} />
    </Container>
  );
};

export default FatalitiesByTimeOfDayWeek;
