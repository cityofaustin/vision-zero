import React from "react";

import { Col, Row, Badge } from "reactstrap";

const GridTableFilterBadges = () => (
  <Row className="mb-2">
    <Col>
      <span className="mr-1">Filters applied:</span>
      <Badge className="mr-1" color="primary">
        Badge
      </Badge>
    </Col>
  </Row>
);

export default GridTableFilterBadges;
