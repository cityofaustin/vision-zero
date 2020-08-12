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
  const StyledWidget = styled.div`
    flex-grow: 1;

    .total {
      font-size: 4em;
    }

    /* Shift icon left to align with Bootstrap card text */
    .widget-icon {
      position: relative;
      right: 5.25px;
      padding-right: 20px;
    }

    /* Center footer icon in footer with .widget-icon above */
    .widget-footer-icon > svg {
      position: relative;
      left: 12.25px;
      bottom: 5px;
    }

    .widget-header-text > h3 {
      font-size: 1.2em;
    }

    /* Center footer text with widget body text above */
    .widget-footer-text {
      padding-left: 22.75px;
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
      <div className="text-left widget-footer-icon d-flex flex-row card-bottom">
        <FontAwesomeIcon size="2x" icon={icon} color={colors.dark} />
        {!!lastYearTotal && (
          <div className="text-muted text-wrap pb-1 pr-1 widget-footer-text">
            {`${text} ${numberWithCommas(lastYearTotal)} this time last year`}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="h-100">
      <StyledWidget>
        <CardBody className="pb-1 h-75">
          <Row>
            <Col>
              {/* Show spinner while waiting for data, add thousands separator to total */}
              <h2 className="h1 total">
                {!!totalsObject ? (
                  numberWithCommas(totalsObject[currentYear])
                ) : (
                  <ColorSpinner color={backgroundColor} />
                )}
              </h2>
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
          <CardFooter className="bg-white h-25">
            {renderFooterBasedOnChange(
              totalsObject[currentYear],
              totalsObject[prevYear]
            )}
          </CardFooter>
        )}
      </StyledWidget>
    </Card>
  );
};

export default SummaryWidget;
