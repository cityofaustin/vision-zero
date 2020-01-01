import React from "react";
import SummaryWidget from "../Widgets/SummaryWidget";
import { Container, Row, Col } from "reactstrap";

const SummaryView = () => {
  return (
    <Container>
      <Row>
        <Col sm="3">
          <SummaryWidget
            header={`Test`}
            mainText="Fatalities"
            icon="fa fa-heartbeat"
            color="danger"
          />
        </Col>
        <Col sm="3">
          <SummaryWidget
            header={`Test 2`}
            mainText="Serious Injuries"
            icon="fa fa-medkit"
            color="warning"
          />
        </Col>
        <Col sm="3">
          <SummaryWidget
            header={`Test 3`}
            mainText="Years of Life Lost"
            icon="fa fa-hourglass-end"
            color="info"
          />
        </Col>
        <Col sm="3">
          <SummaryWidget
            header={`Test 4`}
            mainText="Years of Life Lost"
            icon="fa fa-hourglass-end"
            color="info"
          />
        </Col>
      </Row>
    </Container>
  );
};

export default SummaryView;
