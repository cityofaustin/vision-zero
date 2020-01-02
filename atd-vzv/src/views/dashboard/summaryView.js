import React from "react";
import SummaryWidget from "../Widgets/SummaryWidget";
import SummaryWidgetTest from "../Widgets/SummaryWidget";
import { colors } from "../../constants/colors";
import {
  faHourglass,
  faHeartbeat,
  faMedkit
} from "@fortawesome/free-solid-svg-icons";
import { Container, Row, Col } from "reactstrap";

const SummaryView = () => {
  return (
    <Container>
      <Row>
        <Col sm="3">
          <SummaryWidgetTest
            header={`Test`}
            mainText="Fatalities"
            icon={faHeartbeat}
            color="danger"
          />
        </Col>
        <Col sm="3">
          <SummaryWidgetTest
            header={`Test 2`}
            mainText="Serious Injuries"
            icon={faMedkit}
            color="warning"
          />
        </Col>
        <Col sm="3">
          <SummaryWidgetTest
            header={`Test 3`}
            mainText="Years of Life Lost"
            icon={faHourglass}
            color="info"
          />
        </Col>
        <Col sm="3">
          <SummaryWidgetTest
            header={`Test 4`}
            mainText="Years of Life Lost"
            icon={faHourglass}
            backgroundColor={colors.info}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default SummaryView;
