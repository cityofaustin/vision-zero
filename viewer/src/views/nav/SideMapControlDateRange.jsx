import React, { useState, useEffect } from "react";
import { StoreContext } from "src/constants/context";
import ThemedStyleSheet from "react-with-styles/lib/ThemedStyleSheet";
import aphroditeInterface from "react-with-styles-interface-aphrodite";
import DefaultTheme from "react-dates/lib/theme/DefaultTheme";
import styled from "styled-components";
import {
  mapStartDate,
  mapEndDate,
  dataStartDate,
  dataEndDate,
} from "../../constants/time";
import { colors } from "../../constants/colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faRedoAlt } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SideMapControlDateRange = ({ type }) => {
  const [start, setStart] = useState(dataStartDate);
  const [end, setEnd] = useState(dataEndDate);

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
      setEnd(dataEndDate);
    } else {
      setEnd(date);
    }
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
      margin-left: -24px
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
    <StyledButtonContainer className="pe-0 picker-outline">
      <StyledDatePicker
        id={`map-start-date-${type}`}
        selected={start}
        startDate={start}
        endDate={end}
        onChange={handleStartDateChange}
        dateFormat={"MM/dd/yyyy"}
        selectsStart
        minDate={dataStartDate}
        maxDate={dataEndDate}
        popperPlacement="bottom-start"
        // withPortal // maybe for mobile
      />
      {"-"}
      <StyledDatePicker
        id={`map-end-date-${type}`}
        selected={end}
        startDate={start}
        endDate={end}
        onChange={handleEndDateChange}
        dateFormat={"MM/dd/yyyy"}
        selectsEnd
        minDate={dataStartDate}
        maxDate={dataEndDate}
        popperPlacement="bottom"
        popperClassName="end-date-popper"
        // withPortal // maybe for mobile?
      />
      {/* Show reset button to restore default date range or show calendar icon if default*/}
      {start !== dataStartDate || end !== dataEndDate ? (
        <StyledRedoButton
          title="Reset to default date range"
          icon={faRedoAlt}
          color={colors.dark}
          onClick={() => {
            setStart(mapStartDate);
            setEnd(mapEndDate);
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
  );
};

export default SideMapControlDateRange;
