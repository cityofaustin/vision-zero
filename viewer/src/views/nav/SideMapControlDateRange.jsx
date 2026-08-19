import React, { useState, useEffect } from "react";
import { StoreContext } from "src/constants/context";
import ThemedStyleSheet from "react-with-styles/lib/ThemedStyleSheet";
import aphroditeInterface from "react-with-styles-interface-aphrodite";
import DefaultTheme from "react-dates/lib/theme/DefaultTheme";
import styled from "styled-components";
import { dataStartDate, today } from "../../constants/time";
import { colors } from "../../constants/colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faInfoCircle,
  faRedoAlt,
} from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse, isValid } from "date-fns";

const minDate = new Date(2014, 0, 1);
const DATE_FORMAT = "MM/dd/yyyy";

// Parses a fully-typed raw input string and, if it's an earlier-than-minDate
// date, returns minDate. Returns null if there's nothing to clamp yet.
const clampToMinDate = (raw) => {
  if (!raw || raw.length !== DATE_FORMAT.length) return null; // still mid-typing
  const parsed = parse(raw, DATE_FORMAT, new Date());
  if (!isValid(parsed)) return null;
  return parsed < minDate ? minDate : null;
};

const SideMapControlDateRange = ({ type }) => {
  const [start, setStart] = useState(dataStartDate);
  const [realStart, setRealStart] = useState();
  const [end, setEnd] = useState(today);

  const { setMapDateRange: setMapDate } = React.useContext(StoreContext);

  // Update map date range in Context when picker dates update
  useEffect(() => {
    setMapDate({ start, end });
  }, [start, end, setMapDate]);

  const handleStartDateChange = (date) => {
    if (!date) {
      setStart(dataStartDate);
    } else {
      setStart(date);
    }
  };

  const handleEndDateChange = (date) => {
    if (!date) {
      setEnd(today);
    } else {
      setEnd(date);
    }
  };

  /**
   * Raw date handlers intervene when user enters a date before the min data date
   */
  const handleStartDateRaw = (event) => {
    const clamped = clampToMinDate(event.target.value);
    if (clamped) setStart(clamped);
  };

  const handleEndDateRaw = (event) => {
    const clamped = clampToMinDate(event.target.value);
    if (clamped) setEnd(clamped);
  };

  // Create styled date input
  const StyledDatePicker = styled(DatePicker)`
    font-weight: 200;
    color: rgb(72, 72, 72);
    border: 0px;
    width: 90px
    font-size: 15px;
  `;

  const StyledButtonContainer = styled.div`
    /* Mock a Bootstrap outline button */
    border: 1px solid ${colors.dark};
    height: 34px;
    border-radius: 4px;
    padding-left: 2px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    color: ${colors.dark};
    .end-date-popper {
      margin-left: -24px;
    }
  `;

  // Center and size calendar icon or button
  const calendarInputIconStyles = `position: relative;
    width: 16px;
    height: 16px;
    margin: 2px;
    right: 1px;
  `;

  const StyledCalendarIcon = styled(FontAwesomeIcon)`
    ${calendarInputIconStyles}
  `;

  const StyledRedoButton = styled(FontAwesomeIcon)`
    ${calendarInputIconStyles}
    cursor: pointer;
  `;

  return (
    <>
      <StyledButtonContainer className="pe-0 picker-outline">
        <StyledDatePicker
          id={`map-start-date-${type}`}
          selected={start}
          onChange={handleStartDateChange}
          onChangeRaw={handleStartDateRaw}
          dateFormat={DATE_FORMAT}
          minDate={minDate}
          maxDate={today}
          popperPlacement="bottom-start"
        />
        {"-"}
        <StyledDatePicker
          id={`map-end-date-${type}`}
          selected={end}
          onChange={handleEndDateChange}
          onChangeRaw={handleEndDateRaw}
          dateFormat={DATE_FORMAT}
          minDate={minDate}
          maxDate={today}
          popperPlacement="bottom"
          popperClassName="end-date-popper"
        />
        {/* Show reset button to restore default date range or show calendar icon if default*/}
        {start !== dataStartDate || end !== today ? (
          <StyledRedoButton
            title="Reset to default date range"
            icon={faRedoAlt}
            color={colors.dark}
            onClick={() => {
              setStart(dataStartDate);
              setEnd(today);
            }}
          />
        ) : (
          <StyledCalendarIcon
            title="Default date range"
            icon={faCalendar}
            color={colors.dark}
            onClick={() => null}
          />
        )}
      </StyledButtonContainer>
      <div className="form-text">
        <span>
          <FontAwesomeIcon
            icon={faInfoCircle}
           className="me-1"
          />
        </span>
        <span>Data starts in 2014</span>
      </div>
    </>
  );
};

export default SideMapControlDateRange;
