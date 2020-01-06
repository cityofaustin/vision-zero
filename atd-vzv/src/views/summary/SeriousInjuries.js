import React, { useState, useEffect } from "react";
import axios from "axios";

import { Container, Row, Col } from "reactstrap";
import {
  seriousInjuriesYTDUrl,
  previousYearSeriousInjuriesUrl
} from "./queries/socrataQueries";
import { thisYear, lastYear } from "./helpers/time";
import { calculateTotalInjuries } from "./helpers/helpers";

const SeriousInjuries = () => {
  const [yearToDateInjuryTotal, setYearToDateInjuryTotal] = useState(0);
  const [lastYearToDateInjuryTotal, setLastYearToDateInjuryTotal] = useState(0);

  useEffect(() => {
    // Fetch year-to-date records
    axios.get(seriousInjuriesYTDUrl).then(res => {
      setYearToDateInjuryTotal(calculateTotalInjuries(res.data));
    });

    // Fetch last year-to-date records
    axios.get(previousYearSeriousInjuriesUrl).then(res => {
      setLastYearToDateInjuryTotal(calculateTotalInjuries(res.data));
    });
  }, []);

  return (
    <Container>
      <Row className="text-center">
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
