import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

import { Container, Row, Col } from "reactstrap";

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
  const lastMonthString = moment()
    .subtract(1, "month")
    .format("MMMM");

  const thisYearUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=death_cnt > 0 AND crash_date between '${thisYear}-01-01T00:00:00' and '${lastMonthLastDayDate}T23:59:59'`;

  const [thisYearDeathArray, setThisYearDeathArray] = useState([]);

  useEffect(() => {
    // Fetch records from this year through last month
    axios.get(thisYearUrl).then(res => {
      setThisYearDeathArray(res, lastMonthLastDayDate);
    });
  }, [thisYearUrl, lastMonthLastDayDate]);

  console.log(thisYearDeathArray.data);

  return <Container></Container>;
};

export default FatalitiesByTimeOfDayWeek;
