import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

import { Container, Row, Col } from "reactstrap";

const YearsOfLifeLost = () => {
  const thisYear = moment().format("YYYY");
  const lastYear = moment()
    .subtract(1, "year")
    .format("YYYY");

  const yearToDateUrl = `https://data.austintexas.gov/resource/e4ms-uusv.json?$where=year = '${thisYear}' AND stat_type = 'years_of_life_lost'`;
  const previousYearUrl = `https://data.austintexas.gov/resource/e4ms-uusv.json?$where=year = '${lastYear}' AND stat_type = 'years_of_life_lost'`;

  const [yearToDateYearsLostTotal, setYearToDateYearsLostTotal] = useState(0);
  const [lastYearToDateYearsLostTotal, setLastYearToDateYearsLostTotal] = useState(0);

  useEffect(() => {
    // Fetch year-to-date records
    axios.get(yearToDateUrl).then(res => {
      setYearToDateYearsLostTotal(res.data[0].stat_value);
    });

    // Fetch last year-to-date records
    axios.get(previousYearUrl).then(res => {
      setLastYearToDateYearsLostTotal(res.data[0].stat_value);
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
