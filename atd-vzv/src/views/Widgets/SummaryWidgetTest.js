import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import { Card, CardBody, CardTitle, CardSubtitle } from "reactstrap";

// Create widget out of reactstrap Card component and styled with styled components
// Props: FA icon, blockIcon bg color, header, mainText

const SummaryWidgetTest = (icon, backgroundColor) => {
  const StyledWidget = styled.div`
    block-icon {
      background-color: ${backgroundColor};
    }
  `;

  const blockIcon = () => (
    <div class="block-icon mr-3 float-left">
      <FontAwesomeIcon icon={icon} size="2x" />
    </div>
  );

  return (
    <StyledWidget>
      <Card>
        <CardBody>
          {blockIcon()}
          <CardTitle>Card title</CardTitle>
          <CardSubtitle>Card subtitle</CardSubtitle>
        </CardBody>
      </Card>
    </StyledWidget>
  );
};
