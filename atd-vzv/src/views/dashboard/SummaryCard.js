import React from "react";
import { Card, CardBody } from "reactstrap";

const SummaryCard = component => {
  return (
    <Card>
      <CardBody>{component}</CardBody>
    </Card>
  );
};

export default SummaryCard;
