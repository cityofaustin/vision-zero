import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

import { Container, Row, Col } from "reactstrap";

const SeriousInjuries = () => {
  const today = moment().format("YYYY-MM-DD");
  const todayMonthYear = moment().format("-MM-DD");
  const thisYear = moment().format("YYYY");
  const lastYear = moment()
    .subtract(1, "year")
    .format("YYYY");

  const yearToDateUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=sus_serious_injry_cnt > 0 AND crash_date between '${thisYear}-01-01T00:00:00' and '${today}T23:59:59'`;
  const previousYearUrl = `https://data.austintexas.gov/resource/y2wy-tgr5.json?$where=sus_serious_injry_cnt > 0 AND crash_date between '${lastYear}-01-01T00:00:00' and '${lastYear}${todayMonthYear}T23:59:59'`;

  const [yearToDateInjuryTotal, setYearToDateInjuryTotal] = useState(0);
  const [lastYearToDateInjuryTotal, setLastYearToDateInjuryTotal] = useState(0);

  const calculateTotalInjuries = data => {
    let total = 0;
    data.data.forEach(
      record => (total += parseInt(record.sus_serious_injry_cnt))
    );
    return total;
  };

  useEffect(() => {
    // Fetch year-to-date records
    axios.get(yearToDateUrl).then(res => {
      setYearToDateInjuryTotal(calculateTotalInjuries(res));
    });

    // Fetch last year-to-date records
    axios.get(previousYearUrl).then(res => {
      setLastYearToDateInjuryTotal(calculateTotalInjuries(res));
    });
  }, [yearToDateUrl, previousYearUrl]);

  return (
    <Container>
      <Row>
        <Col>
          <h5>{thisYear}</h5>
          <h1>{yearToDateInjuryTotal}</h1>
        </Col>
        <Col>
          <h5>{lastYear}</h5>
          <h1>{lastYearToDateInjuryTotal}</h1>
        </Col>
      </Row>
    </Container>
  );
};

export default SeriousInjuries;
