import React from "react";
import ColorSpinner from "../Spinner/ColorSpinner";

import { Card, CardBody, Row, Col, CardTitle, CardSubtitle } from "reactstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../constants/colors";

const SummaryWidget = ({ total, text, icon, backgroundColor }) => {
  const StyledWidget = styled.div`
    .total {
      /* color: ${backgroundColor}; */
      font-size: 4em;
      /* font-weight: bold; */
    }

    /* .widget-text {
      color: ${colors.dark};
      font-size: 1.2em;
    } */

    /* Square background for FA icon */
    /* .block-icon-parent {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: ${backgroundColor};
      width: 4em;
      height: 4em;
    } */

    /* .block-icon {
      font-size: 2.5em;
    } */
  `;

  const renderIcon = () => (
    <span className="fa-layers fa-fw">
      <FontAwesomeIcon size="lg" icon={faCircle} color={backgroundColor} />
      <FontAwesomeIcon
        size="lg"
        icon={icon}
        inverse
        transform="shrink-6"
        color={colors.white}
      />
    </span>
  );

  return (
    <StyledWidget>
      <Card>
        <CardBody>
          <Row>
            {/* Set Bootstrap breakpoints to prevent overlap of icon and total */}
            <Col>
              {/* Show spinner while waiting for data, add thousands separator to total */}
              <h1 className="total">
                {total !== null ? total.toLocaleString() : <ColorSpinner />}
              </h1>
            </Col>
          </Row>
          <Row>
            <Col xl="6">{renderIcon()}</Col>
            <Col xl="6">{text}</Col>
          </Row>
        </CardBody>
      </Card>
    </StyledWidget>
  );
};

export default SummaryWidget;
