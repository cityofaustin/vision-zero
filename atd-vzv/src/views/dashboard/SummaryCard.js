import React from "react";
import { Card, CardBody, Col } from "reactstrap";

const SummaryCard = ({ subComponent }) => {
  return (
    <Col md="6">
      <Card>
        <CardBody>{subComponent}</CardBody>
      </Card>
    </Col>
  );
};

export default SummaryCard;
