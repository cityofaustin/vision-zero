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
  faSlash,
} from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../constants/colors";

const SummaryWidget = ({
  total,
  lastYearTotal,
  text,
  icon,
  backgroundColor,
}) => {
  const StyledWidget = styled.div`
    .total {
      font-size: 4em;
    }

    .secondary-text {
      color: ${colors.secondary};
    }

    /* Shift icon left to align with Bootstrap card text */
    .widget-icon {
      position: relative;
      right: 5.25px;
    }

    .widget-footer {
      background: ${colors.white};
    }

    /* Center change icon in footer with .widget-icon above */
    .widget-change-icon {
      position: relative;
      left: 12.25px;
    }
  `;
  const displayYear = dataEndDate.format("YYYY");

  const renderIcon = () => (
    <span className="fa-layers fa-3x fa-fw widget-icon">
      <FontAwesomeIcon icon={faCircle} color={backgroundColor} />
      <FontAwesomeIcon
        icon={icon}
        inverse
        transform="shrink-6"
        color={colors.white}
      />
    </span>
  );

  const renderFooterBasedOnChange = (total, lastYearTotal) => {
    const icon =
      (total > lastYearTotal && faCaretUp) ||
      (total < lastYearTotal && faCaretDown) ||
      faSlash;
    const text =
      (total > lastYearTotal && "Up from") ||
      (total < lastYearTotal && "Down from") ||
      "Same as";

    return (
      <Row className="card-bottom">
        <Col xl="3" className="text-left widget-change-icon">
          <FontAwesomeIcon size="2x" icon={icon} color={colors.dark} />
        </Col>
        <Col xl="9" className="text-muted pl-0 pt-1">
          {`${text} ${lastYearTotal} this time last year`}
        </Col>
      </Row>
    );
  };

  // 1. TODO Fix mobile styles xl and down
  // 2. TODO Write logic for change from previous year
  // 3. TODO Optimize API calls

  return (
    <StyledWidget>
      <Card>
        <CardBody className="pb-2">
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
            <Col xl="3" className="text-left">
              {renderIcon()}
            </Col>
            <Col xl="9">
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
          {renderFooterBasedOnChange(total, lastYearTotal)}
        </CardFooter>
      </Card>
    </StyledWidget>
  );
};

export default SummaryWidget;
