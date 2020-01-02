import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquare } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { colors } from "../../constants/colors";
import { Card, CardBody, CardTitle, CardSubtitle } from "reactstrap";

// Create widget out of reactstrap Card component and styled with styled components
// Props: FA icon, blockIcon bg color, header, mainText

const SummaryWidgetTest = (icon, backgroundColor, header, mainText) => {
  const StyledWidget = styled.div`
    block-icon {
    }
  `;

  const blockIcon = () => (
    <span class="fa-layers fa-fw">
      <FontAwesomeIcon icon={faSquare} color="black" size="3x" />
      <FontAwesomeIcon icon={icon} size="2x" color="white" />
    </span>
  );

  return (
    <Card>
      <CardBody>
        {blockIcon()}
        <CardTitle>
          <FontAwesomeIcon icon={icon} size="2x" color="black" />
          {header}
        </CardTitle>
        <CardSubtitle>{mainText}</CardSubtitle>
      </CardBody>
    </Card>
  );
};

export default SummaryWidgetTest;
