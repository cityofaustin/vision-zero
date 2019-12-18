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

  const thisYearUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=death_cnt > 0 AND crash_date between '${thisYear}-01-01T00:00:00' and '${lastMonthLastDayDate}T23:59:59'`;

  const getFatalitiesByYearsAgoUrl = yearsAgo => {
    let yearsAgoDate = moment()
      .subtract(yearsAgo, "year")
      .format("YYYY");
    return `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=death_cnt > 0 AND crash_date between '${yearsAgoDate}-01-01T00:00:00' and '${yearsAgoDate}-12-31T23:59:59'`;
  };

  const [thisYearDeathArray, setThisYearDeathArray] = useState([]);
//   const [lastYearDeathArray, setLastYearDeathArray] = useState([]);
//   const [twoYearsAgoDeathArray, setTwoYearsAgoDeathArray] = useState([]);
//   const [threeYearsAgoDeathArray, setThreeYearsAgoDeathArray] = useState([]);
//   const [fourYearsAgoDeathArray, setFourYearsAgoDeathArray] = useState([]);
//   const [fiveYearsAgoDeathArray, setFiveYearsAgoDeathArray] = useState([]);

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
    // Fetch records from this year through last month
    axios.get(thisYearUrl).then(res => {
      setThisYearDeathArray(calculatHourBlockTotals(res, lastMonthLastDayDate));
    });

    // // Fetch records from last year
    // axios.get(getFatalitiesByYearsAgoUrl(1)).then(res => {
    //   setLastYearDeathArray(calculatHourBlockTotals(res));
    // });

    // // Fetch records from two years ago
    // axios.get(getFatalitiesByYearsAgoUrl(2)).then(res => {
    //   setTwoYearsAgoDeathArray(calculatHourBlockTotals(res));
    // });

    // // Fetch records from three years ago
    // axios.get(getFatalitiesByYearsAgoUrl(3)).then(res => {
    //   setThreeYearsAgoDeathArray(calculatHourBlockTotals(res));
    // });

    // // Fetch records from four years ago
    // axios.get(getFatalitiesByYearsAgoUrl(4)).then(res => {
    //   setFourYearsAgoDeathArray(calculatHourBlockTotals(res));
    // });

    // // Fetch records from five years ago
    // axios.get(getFatalitiesByYearsAgoUrl(5)).then(res => {
    //   setFiveYearsAgoDeathArray(calculatHourBlockTotals(res));
    // });
  }, [
    thisYearUrl,
    // getFatalitiesByYearsAgoUrl(1),
    // getFatalitiesByYearsAgoUrl(2),
    // getFatalitiesByYearsAgoUrl(3),
    // getFatalitiesByYearsAgoUrl(4),
    // getFatalitiesByYearsAgoUrl(5),
    lastMonthLastDayDate
  ]);

  console.log(thisYearDeathArray);

  return (
    <Container>
      <Heatmap height={350} width={350} data={thisYearDeathArray} />
    </Container>
  );
};

export default FatalitiesByTimeOfDayWeek;
