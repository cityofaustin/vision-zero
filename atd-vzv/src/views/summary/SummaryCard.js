import React from "react";

import styled from "styled-components";
import { Card, CardBody, Col } from "reactstrap";

const SummaryCard = ({ child }) => {
  const StyledCardTitle = styled.div`
    font-size: 2em;
    text-align: center;
    padding-bottom: 0.75em;
  `;

  return (
    <Col className="summary-child" xl="6" md="12">
      {/* Set height to fill parent column */}
      <Card>
        <CardBody className="h-100 py-0">
          <StyledCardTitle>{child.title}</StyledCardTitle>
          {child.component}
        </CardBody>
      </Card>
    </Col>
  );
};

export default SummaryCard;
