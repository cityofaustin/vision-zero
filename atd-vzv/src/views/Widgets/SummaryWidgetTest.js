import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import { colors } from "../../constants/colors";
import { Card, CardBody, Row, Col, CardTitle, CardSubtitle } from "reactstrap";

// Create widget out of reactstrap Card component and styled with styled components
// Props: FA icon, blockIcon bg color, header, mainText

const SummaryWidgetTest = ({ total, text, icon, backgroundColor }) => {
  const StyledWidget = styled.div`
    .widget-card {
    }

    .widget-title {
      color: ${backgroundColor};
      font-size: 2.75em;
      font-weight: bold;
    }

    .widget-text {
      color: ${colors.dark};
      font-weight: bold;
    }

    .block-icon-parent {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: ${backgroundColor};
      width: 4em;
      height: 4em;
    }

    .block-icon {
      font-size: 2.5em;
    }
  `;

  const blockIcon = () => (
    <span className="block-icon-parent text-center">
      <FontAwesomeIcon
        className="block-icon"
        icon={icon}
        color={colors.light}
      />
    </span>
  );

  return (
    <StyledWidget>
      <Card className="widget-card m-1">
        <CardBody>
          <Row className="mb-2">
            <Col>{blockIcon()}</Col>
            <Col className="text-right">
              <CardTitle className="widget-title">{total}</CardTitle>
            </Col>
          </Row>
          <Row>
            <Col>
              <CardSubtitle className="widget-text">{text}</CardSubtitle>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </StyledWidget>
  );
};

export default SummaryWidgetTest;
