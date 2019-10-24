import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

import { Container, Row, Col } from "reactstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMale } from "@fortawesome/free-solid-svg-icons";

const StyledIcon = styled.i`
  margin: 0px 2px 0px 2px;
`;

const Fatalities = () => {
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
    // Create array with length of fatalityTotal and use to iterate
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
  }, [yearToDateUrl, previousYearUrl]);

  return (
    <Container>
      <h3>Year-to-Date Fatalities</h3>
      <Row>
        <Col sm="6">
          <p>{thisYear}</p>
          <h2>{yearToDateFatalityTotal}</h2>
          <p className="text-left">
            {renderFatalityIcons(yearToDateFatalityTotal)}
          </p>
        </Col>
        <Col sm="6">
          <p>{lastYear}</p>
          <h2>{lastYearToDateFatalityTotal}</h2>
          <p className="text-left">
            {renderFatalityIcons(lastYearToDateFatalityTotal)}
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default Fatalities;
