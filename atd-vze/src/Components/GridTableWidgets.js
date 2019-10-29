import React from "react";
import get from "lodash.get";

import { Col, Row } from "reactstrap";
import Widget02 from "../views/Widgets/Widget02";

const GridTableWidgets = ({ aggData, widgetsConfig }) => {
  // Use lodash get() to expose nested data from aggData using dataPath from widgetsConfig
  const getData = widget => {
    // If data is sum of many aggregates, sum and return
    if (widget.sum) {
      let sum = 0;
      widget.dataPath.forEach(path => (sum += get(aggData, path)));
      return sum;
    } else {
      const path = widget.dataPath;
      return get(aggData, path);
    }
  };

  return (
    <Col>
      <Row>
        {widgetsConfig.map((widget, i) => (
          <Col key={i} xs="12" sm="6" md="4">
            <Widget02
              key={i}
              header={getData(widget)}
              mainText={widget.mainText}
              icon={widget.icon}
              color={widget.color}
            />
          </Col>
        ))}
      </Row>
    </Col>
  );
};

export default GridTableWidgets;
