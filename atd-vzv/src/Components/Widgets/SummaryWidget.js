import React from "react";
import ColorSpinner from "../Spinner/ColorSpinner";

import { Card, CardBody, Row, Col, CardTitle, CardSubtitle } from "reactstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { colors } from "../../constants/colors";

const SummaryWidget = ({ total, text, icon, backgroundColor }) => {
  const StyledWidget = styled.div`
    .widget-total {
      color: ${backgroundColor};
      font-size: 3em;
      font-weight: bold;
    }

    .widget-text {
      color: ${colors.dark};
      font-size: 1.2em;
    }

    /* Square background for FA icon */
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
      <Card>
        <CardBody>
          <Row className="mb-2">
            {/* Set Bootstrap breakpoints to prevent overlap of icon and total */}
            <Col xl="4" xs="3">
              {blockIcon()}
            </Col>
            <Col className="widget-column">
              <CardTitle className="widget-total">
                {/* Show spinner while waiting for data, add thousands separator to total */}
                {total !== null ? total.toLocaleString() : <ColorSpinner />}
              </CardTitle>
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

export default SummaryWidget;
