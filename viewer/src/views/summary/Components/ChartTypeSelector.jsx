import React from "react";
import { Row, Col, Button } from "reactstrap";
import styled from "styled-components";
import classnames from "classnames";
import { colors } from "../../../constants/colors";

const ChartTypeSelector = ({ chartTypes, chartType, setChartType }) => {
  const toggle = (tab) => {
    if (chartType !== tab) {
      setChartType(tab);
    }
  };

  // Set styles to override Bootstrap default styling
  const StyledButton = styled.div`
    .chart-toggle-button {
      color: ${colors.dark};
      background: ${colors.buttonBackground} 0% 0% no-repeat padding-box;
      border-style: none;
      opacity: 1;
      margin-left: 5px;
      margin-right: 5px;
    }
  `;

  return (
    <Row className="text-center">
      <Col className="pb-2">
        <StyledButton>
          {chartTypes.map((type) => (
            <Button
              key={type}
              className={classnames(
                {
                  active: chartType === type,
                },
                "chart-toggle-button"
              )}
              onClick={() => {
                toggle(type);
              }}
            >
              {type}
            </Button>
          ))}
        </StyledButton>
      </Col>
    </Row>
  );
};

export default ChartTypeSelector;
