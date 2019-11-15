import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

import { Container, Row, Col } from "reactstrap";

const YearsOfLifeLost = () => {
  const today = moment().format("YYYY-MM-DD");
  const todayMonthYear = moment().format("-MM-DD");
  const thisYear = moment().format("YYYY");
  const lastYear = moment()
    .subtract(1, "year")
    .format("YYYY");

  const yearToDateUrl = `https://data.austintexas.gov/resource/xecs-rpy9.json?$where=prsn_injry_sev_id = '4' AND crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;
  const previousYearUrl = `https://data.austintexas.gov/resource/xecs-rpy9.json?$where=prsn_injry_sev_id = '4' AND crash_date between '${lastYear}-01-01T00:00:00' and '${lastYear}${todayMonthYear}T23:59:59'`;

  const [yearToDateYearsLostTotal, setYearToDateYearsLostTotal] = useState(0);
  const [
    lastYearToDateYearsLostTotal,
    setLastYearToDateYearsLostTotal
  ] = useState(0);

  const getYearsOfLifeLost = fatalityData => {
    // Assume 75 year life expectancy,
    // Find the difference between person.prsn_age & 75
    // Sum over the list of ppl with .reduce
    return fatalityData.reduce((accumulator, fatalityRecord) => {
      let years = 0;
      if (fatalityRecord.prsn_age !== undefined) {
        let yearsLifeLost = 75 - Number(fatalityRecord.prsn_age);
        // What if the person is older than 75?
        // For now, so we don't have negative numbers,
        // Assume years of life lost is 0
        years = yearsLifeLost < 0 ? 0 : yearsLifeLost;
      }
      return accumulator + years;
    }, 0); // start with a count at 0 years
  };

  const formatNumber = number => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    // Fetch year-to-date records
    axios.get(yearToDateUrl).then(res => {
      setYearToDateYearsLostTotal(formatNumber(getYearsOfLifeLost(res.data)));
    });

    // Fetch last year-to-date records
    axios.get(previousYearUrl).then(res => {
      setLastYearToDateYearsLostTotal(formatNumber(getYearsOfLifeLost(res.data)));
    });
  }, [yearToDateUrl, previousYearUrl]);

  return (
    <Container>
      <h3>Year-to-Date Years of Life Lost</h3>
      <br />
      <Row>
        <Col>
          <h5>{thisYear}</h5>
          <h1>{yearToDateYearsLostTotal}</h1>
        </Col>
        <Col>
          <h5>{lastYear}</h5>
          <h1>{lastYearToDateYearsLostTotal}</h1>
        </Col>
      </Row>
    </Container>
  );
};

export default YearsOfLifeLost;
