import React from "react";
import ColorSpinner from "../Spinner/ColorSpinner";
import { dataEndDate, yearsArray } from "../../constants/time";

import { Card, CardBody, Row, Col } from "reactstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../constants/colors";

const SummaryWidget = ({ total, text, icon, backgroundColor }) => {
  const StyledWidget = styled.div`
    .total {
      font-size: 4em;
    }

    .year-text {
      color: ${colors.secondary};
    }
  `;
  const displayYear = dataEndDate.format("YYYY");

  const renderIcon = () => (
    <span className="fa-layers fa-3x fa-fw">
      <FontAwesomeIcon icon={faCircle} color={backgroundColor} />
      <FontAwesomeIcon
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
            <Col>
              {/* Show spinner while waiting for data, add thousands separator to total */}
              <h1 className="total">
                {total !== null ? total.toLocaleString() : <ColorSpinner />}
              </h1>
            </Col>
          </Row>
          <Row>
            <Col xl="4" className="text-center">
              {renderIcon()}
            </Col>
            <Col xl="8">
              <Row>
                <h5 className="mb-0">{text}</h5>
              </Row>
              <Row>
                <h5 className="year-text">{`in ${displayYear}`}</h5>
              </Row>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </StyledWidget>
  );
};

export default SummaryWidget;
