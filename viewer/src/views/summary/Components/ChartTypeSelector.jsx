import React from "react";
import { Row, Col, Button } from "reactstrap";
import classnames from "classnames";

const ChartTypeSelector = ({ chartTypes, chartType, setChartType }) => {
  const toggle = (tab) => {
    if (chartType !== tab) {
      setChartType(tab);
    }
  };

  return (
    <Row className="text-center">
      <Col className="pb-2">
        {chartTypes.map((type) => (
          <Button
            key={type}
            color="light"
            className={classnames(
              {
                active: chartType === type,
              },
              "chart-toggle-button",
            )}
            onClick={() => {
              toggle(type);
            }}
          >
            {type}
          </Button>
        ))}
      </Col>
    </Row>
  );
};

export default ChartTypeSelector;
