import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import { colors } from "../../constants/colors";
import { Card, CardBody, CardTitle, CardSubtitle, Row, Col } from "reactstrap";

// Create widget out of reactstrap Card component and styled with styled components
// Props: FA icon, blockIcon bg color, header, mainText

const SummaryWidgetTest = ({ header, mainText, icon, backgroundColor }) => {
  const StyledWidget = styled.div`
    .block-icon-parent {
      display: flex;
      background-color: ${backgroundColor};
      width: 50px;
      height: 50px;
    }

    .block-icon {
      align-content: center;
    }
  `;

  const blockIcon = () => (
    <div className="block-icon-parent text-center">
      <FontAwesomeIcon
        className="block-icon"
        icon={icon}
        size="3x"
        color={colors.light}
      />
    </div>
  );

  return (
    <StyledWidget>
      <Card>
        <CardBody>
          <Row>
            <Col md="3">{blockIcon()}</Col>
            <Col md="9">
              <CardTitle>{header}</CardTitle>
              <CardSubtitle>{mainText}</CardSubtitle>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </StyledWidget>
  );
};

export default SummaryWidgetTest;
