import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMale } from "@fortawesome/free-solid-svg-icons";

// Endpoint: https://data.austintexas.gov/resource/y2wy-tgr5.json
// Need to display pictorial chart of:
// 1. Year-to-date fatalities for current
// 2. Fatalities from previous year

const StyledIcon = styled.i`
  margin: 0px 2px 0px 2px;
`;

const Fatalities = props => {
  const today = moment().format("YYYY-MM-DD");
  const todayMonthYear = moment().format("-MM-DD");
  const thisYear = moment().format("YYYY");
  const lastYear = moment()
    .subtract(1, "year")
    .format("YYYY");

  const yearToDateUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=death_cnt > 0 AND crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;
  const previousYearUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=death_cnt > 0 AND crash_date between '${lastYear}-01-01T00:00:00' and '${lastYear}${todayMonthYear}T23:59:59'`;

  const [yearToDateFatalityTotal, setYearToDateFatalityTotal] = useState(0);
  const [
    lastYearToDateFatalityTotal,
    setLastYearToDateFatalityTotal
  ] = useState(0);

  const calculateTotalFatalities = data => {
    let total = 0;
    data.data.forEach(record => (total += parseInt(record.death_cnt)));
    return total;
  };

  const renderFatalityIcons = fatalityTotal =>
    [...Array(fatalityTotal)].map((e, i) => (
      <StyledIcon>
        <FontAwesomeIcon icon={faMale} key={i} size="lg" />
      </StyledIcon>
    ));

  useEffect(() => {
    // Fetch year-to-date records
    axios.get(yearToDateUrl).then(res => {
      setYearToDateFatalityTotal(calculateTotalFatalities(res));
    });

    // Fetch last year-to-date records
    axios.get(previousYearUrl).then(res => {
      setLastYearToDateFatalityTotal(calculateTotalFatalities(res));
    });
  }, []);

  return (
    <div>
      <h3>Year-to-Date Fatalities</h3>
      <p>
        {thisYear}: {yearToDateFatalityTotal}
      </p>
      <p>
        {lastYear}: {lastYearToDateFatalityTotal}
      </p>
      <p>{thisYear}</p>
      <p>{renderFatalityIcons(yearToDateFatalityTotal)}</p>
      <p>{lastYear}</p>
      <p>{renderFatalityIcons(lastYearToDateFatalityTotal)}</p>
    </div>
  );
};

export default Fatalities;
