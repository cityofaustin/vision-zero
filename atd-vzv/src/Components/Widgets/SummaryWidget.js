import React from "react";
import ColorSpinner from "../Spinner/ColorSpinner";
import { dataEndDate } from "../../constants/time";

import { Card, CardBody, Row, Col, CardFooter } from "reactstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle,
  faCaretDown,
  faCaretUp,
} from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../constants/colors";

const SummaryWidget = ({ total, text, icon, backgroundColor }) => {
  const StyledWidget = styled.div`
    .total {
      font-size: 4em;
    }

    .secondary-text {
      color: ${colors.secondary};
    }

    .widget-footer {
      background: ${colors.white};
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

  const renderChangeIcon = () => {};

  return (
    <StyledWidget>
      <Card>
        <CardBody className="pb-0">
          <Row>
            <Col>
              {/* Show spinner while waiting for data, add thousands separator to total */}
              <h1 className="total">
                {total !== null ? (
                  total.toLocaleString()
                ) : (
                  <ColorSpinner color={backgroundColor} />
                )}
              </h1>
            </Col>
          </Row>
          <Row>
            <Col xl="4" className="text-left">
              {renderIcon()}
            </Col>
            <Col xl="8">
              <Row>
                <h5 className="mb-0">{text}</h5>
              </Row>
              <Row>
                <h5 className="text-muted">{`in ${displayYear}`}</h5>
              </Row>
            </Col>
          </Row>
        </CardBody>
        <CardFooter className="widget-footer">
          <Row className="card-bottom">
            <Col xl="4" className="text-center">
              <FontAwesomeIcon
                size="2x"
                icon={faCaretDown}
                color={colors.dark}
              />
            </Col>
            <Col xl="8" className="text-muted pl-0 pt-1">
              {"Down from 14 this time last year"}
            </Col>
          </Row>
        </CardFooter>
      </Card>
    </StyledWidget>
  );
};

export default SummaryWidget;
