import React from "react";

import styled from "styled-components";
import { Card, CardBody, Col } from "reactstrap";

const StyledCardTitle = styled.div`
  font-size: 2em;
  text-align: center;
  padding-bottom: 0.75em;
`;

const SummaryCard = ({ child }) => {
  return (
    <Col className="summary-child" xl="6" md="12">
      {/* Set height to fill parent column */}
      <Card className="h-100">
        <CardBody className="py-0 mb-2">
          <StyledCardTitle>{child.title}</StyledCardTitle>
          {child.component}
        </CardBody>
      </Card>
    </Col>
  );
};

export default SummaryCard;
