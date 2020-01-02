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
      font-size: 3em;
      font-weight: bold;
    }

    .widget-text {
      color: ${colors.dark};
      font-size: 1.2em;
    }

    .block-icon-parent {
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
    <span className="block-icon-parent">
      <FontAwesomeIcon
        className="block-icon"
        icon={icon}
        color={colors.light}
      />
    </span>
  );

  return (
    <StyledWidget>
      <Card className="m-1">
        <CardBody>
          <Row className="mb-2">
            <Col xl="4" xs="3">
              {blockIcon()}
            </Col>
            <Col className="widget-column">
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
