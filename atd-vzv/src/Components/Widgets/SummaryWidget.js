import React from "react";
import ColorSpinner from "../Spinner/ColorSpinner";
import {
  currentYearString as currentYear,
  prevYearString as prevYear,
} from "../../constants/time";

import { Card, CardBody, Row, Col, CardFooter } from "reactstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle,
  faCaretDown,
  faCaretUp,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../constants/colors";

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const SummaryWidget = ({
  totalsObject,
  text,
  icon,
  backgroundColor,
  infoPopover,
}) => {
  const StyledWidgetCard = styled(Card)`
    height: 100%;
    flex-grow: 1;

    .total {
      font-size: 4em;
    }

    .widget-body {
      height: 70%;
    }

    .widget-footer {
      height: 30%;
    }

    /* Shift icon left to align with Bootstrap card text */
    .widget-icon {
      position: relative;
      right: 5.25px;
    }

    /* Center footer icon in footer with .widget-icon above */
    .widget-footer-icon > svg {
      position: relative;
      left: 12.25px;
      bottom: 1px;
    }

    .widget-header-text > h3 {
      font-size: 1.2em;
    }
  `;

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

  const renderFooterBasedOnChange = (currentYearTotal, lastYearTotal) => {
    const icon =
      (currentYearTotal > lastYearTotal && faCaretUp) ||
      (currentYearTotal < lastYearTotal && faCaretDown) ||
      faMinus;
    const text =
      (currentYearTotal > lastYearTotal && "Up from") ||
      (currentYearTotal < lastYearTotal && "Down from") ||
      "Same as";

    return (
      <div className="text-left widget-footer-icon d-flex flex-row align-items-center">
        <FontAwesomeIcon size="2x" icon={icon} color={colors.dark} />
        {!!lastYearTotal && (
          <span className="text-muted text-wrap pl-4">
            {`${text} ${numberWithCommas(lastYearTotal)} this time last year`}
          </span>
        )}
      </div>
    );
  };

  return (
    <StyledWidgetCard>
      <CardBody className="widget-body">
        <Row>
          <Col>
            {/* Show spinner while waiting for data, add thousands separator to total */}
              {!!totalsObject ? (
                <h2 className="h1 total">
                  {numberWithCommas(totalsObject[currentYear])}
                </h2>
              ) : (
                <h2 className="h1 total">
                  <p className="sr-only">
                    Data loading
                  </p>
                  <ColorSpinner color={backgroundColor} />
                </h2>
              )}
          </Col>
        </Row>
        <div className="text-left d-flex flex-row">
          {renderIcon()}
          <div className="d-flex flex-column widget-header-text">
            <h3 className="h5 mb-0">
              {text} {infoPopover}
            </h3>
            <h3 className="h5 text-muted">{`in ${currentYear}`}</h3>
          </div>
        </div>
      </CardBody>
      {!!totalsObject && (
        <CardFooter className="bg-white d-flex widget-footer">
          {renderFooterBasedOnChange(
            totalsObject[currentYear],
            totalsObject[prevYear]
          )}
        </CardFooter>
      )}
    </StyledWidgetCard>
  );
};

export default SummaryWidget;
