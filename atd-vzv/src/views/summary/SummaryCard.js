import React from "react";
import { Card, CardBody, Col } from "reactstrap";

const SummaryCard = ({ child }) => {
  return (
    <Col className="summary-child" xl="6" md="12">
      {/* Set height to fill parent column */}
      <Card className="h-100">
        <CardBody className="">{child}</CardBody>
      </Card>
    </Col>
  );
};

export default SummaryCard;
