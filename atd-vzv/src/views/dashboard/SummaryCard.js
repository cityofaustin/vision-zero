import React from "react";
import { Card, CardBody, Col } from "reactstrap";

const SummaryCard = ({ child }) => {
  return (
    <Col xl="6" md="12" className="mb-2 mt-2">
      {/* Set height to fill parent column */}
      <Card className="h-100">
        <CardBody className="">{child}</CardBody>
      </Card>
    </Col>
  );
};

export default SummaryCard;
