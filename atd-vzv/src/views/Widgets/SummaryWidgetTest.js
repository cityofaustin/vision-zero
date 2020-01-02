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

    .widget-header {
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
      background-color: ${backgroundColor};
      width: 4em;
      height: 4em;
    }

    .block-icon {
    }
  `;

  const blockIcon = () => (
    <span className="block-icon-parent text-center">
      <FontAwesomeIcon
        className="block-icon"
        icon={icon}
        size="3x"
        color={colors.light}
      />
    </span>
  );

  return (
    <StyledWidget>
      <Card className="widget-card m-1">
        <CardBody>
          <Row className="mb-2">
            <Col lg="3">{blockIcon()}</Col>
            <Col lg="9" className="text-center">
              <CardTitle className="widget-header">{total}</CardTitle>
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
