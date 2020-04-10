import React from "react";
import ColorSpinner from "../Spinner/ColorSpinner";
import {
  currentYearString as currentYear,
  prevYearString as prevYear,
  currentYearString
} from "../../constants/time";

import { Card, CardBody, Row, Col, CardFooter } from "reactstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle,
  faCaretDown,
  faCaretUp
} from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../constants/colors";

const SummaryWidget = ({ totalsObject, text, icon, backgroundColor }) => {
  const StyledWidget = styled.div`
    .total {
      font-size: 4em;
    }

    /* Shift icon left to align with Bootstrap card text */
    .widget-icon {
      position: relative;
      right: 5.25px;
      padding-right: 20px;
    }

    .widget-footer {
      background: ${colors.white};
    }

    /* Center footer icon in footer with .widget-icon above */
    .widget-footer-icon {
      position: relative;
      left: 12.25px;
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
      null;
    const text =
      (currentYearTotal > lastYearTotal && "Up from") ||
      (currentYearTotal < lastYearTotal && "Down from") ||
      "Same as";

    return (
      <div className="text-left widget-footer-icon d-flex flex-row card-bottom">
        {!!icon ? (
          <FontAwesomeIcon size="2x" icon={icon} color={colors.dark} />
        ) : (
          "--"
        )}
        {!!lastYearTotal && (
          <div className="text-muted text-wrap pt-1 pr-1 widget-footer-text">
            {`${text} ${lastYearTotal.toLocaleString()} this time last year`}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <StyledWidget>
        <CardBody className="pb-2">
          <Row>
            <Col>
              {/* Show spinner while waiting for data, add thousands separator to total */}
              <h1 className="total">
                {!!totalsObject ? (
                  totalsObject[currentYear].toLocaleString()
                ) : (
                  <ColorSpinner color={backgroundColor} />
                )}
              </h1>
            </Col>
          </Row>
          <div className="text-left d-flex flex-row">
            {renderIcon()}
            <div className="d-flex flex-column">
              <h5 className="mb-0">{text}</h5>
              <h5 className="text-muted">{`in ${currentYearString}`}</h5>
            </div>
          </div>
        </CardBody>
        {!!totalsObject && (
          <CardFooter className="widget-footer">
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
