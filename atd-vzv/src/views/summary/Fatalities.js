import React, { useState, useEffect } from "react";
import axios from "axios";
import { calculateTotalFatalities } from "./helpers/helpers";
import { thisYear, lastYear } from "./helpers/time";
import {
  fatalitiesYTDUrl,
  previousYearFatalitiesUrl
} from "./queries/socrataQueries";

import { Container, Row, Col } from "reactstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMale } from "@fortawesome/free-solid-svg-icons";

const StyledIcon = styled.i`
  margin: 0px 2px 0px 2px;
`;

const Fatalities = () => {
  const [yearToDateFatalityTotal, setYearToDateFatalityTotal] = useState(0);
  const [
    lastYearToDateFatalityTotal,
    setLastYearToDateFatalityTotal
  ] = useState(0);

  const renderFatalityIcons = fatalityTotal =>
    // Create array with length of fatalityTotal and use to iterate
    [...Array(fatalityTotal)].map((e, i) => (
      <StyledIcon>
        <FontAwesomeIcon icon={faMale} key={i} size="lg" />
      </StyledIcon>
    ));

  useEffect(() => {
    // Fetch year-to-date records
    axios.get(fatalitiesYTDUrl).then(res => {
      setYearToDateFatalityTotal(calculateTotalFatalities(res.data));
    });

    // Fetch last year-to-date records
    axios.get(previousYearFatalitiesUrl).then(res => {
      setLastYearToDateFatalityTotal(calculateTotalFatalities(res.data));
    });
  }, []);

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
