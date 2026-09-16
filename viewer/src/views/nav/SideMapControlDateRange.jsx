import React, { useState, useEffect } from "react";
import { StoreContext } from "src/constants/context";
import styled from "styled-components";
import { dataStartDate, today } from "../../constants/time";
import { colors } from "../../constants/colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faUndo } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse, format } from "date-fns";
import { Button } from "reactstrap";

const minDate = new Date(2014, 0, 1);
const DATE_FORMAT = "MM/dd/yyyy";

// Create styled date input
const StyledDatePicker = styled(DatePicker)`
  font-weight: 200;
  color: rgb(72, 72, 72);
  width: 110px;
  font-size: 15px;
`;

const StyledNativeDateInput = styled.input`
  font-family: inherit;
  font-weight: 200;
  color: rgb(72, 72, 72);
  background: transparent;
  width: 110px;
  font-size: 15px;
`;

const StyledButtonContainer = styled.div`
  /* Mock a Bootstrap outline button */
  border: 1px solid ${colors.dark};
  min-height: 34px;
  border-radius: 4px;
  display: flex;
  padding: 10px;
  flex-direction: column;
  color: ${colors.dark};
`;

const StyledDateRow = styled.div`
  height: 34px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 0px;
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

const StyledActionRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 5px;
  button {
    flex: 1;
  }
`;

const SideMapControlDateRange = ({ type }) => {
  const isMobile = type === "temporary";

  // Applied date range — what's actually pushed to the map/context
  const [start, setStart] = useState(dataStartDate);
  const [end, setEnd] = useState(today);

  // Staged/draft date range — bound to the inputs, only applied on demand
  const [pendingStart, setPendingStart] = useState(dataStartDate);
  const [pendingEnd, setPendingEnd] = useState(today);

  const hasPendingChange =
    pendingStart.getTime() !== start.getTime() ||
    pendingEnd.getTime() !== end.getTime();

  const showReset =
    !hasPendingChange &&
    (start.getTime() !== dataStartDate.getTime() ||
      end.getTime() !== today.getTime());

  const { setMapDateRange: setMapDate } = React.useContext(StoreContext);

  // Update map date range in Context when the applied dates change
  // (on mount, and whenever Apply or Reset is clicked)
  useEffect(() => {
    setMapDate({ start, end });
  }, [start, end, setMapDate]);

  const handleApply = () => {
    const clampedStart = pendingStart < minDate ? minDate : pendingStart;
    const clampedEnd = pendingEnd < minDate ? minDate : pendingEnd;
    setStart(clampedStart);
    setEnd(clampedEnd);
    setPendingStart(clampedStart);
    setPendingEnd(clampedEnd);
  };

  const handleReset = () => {
    setStart(dataStartDate);
    setEnd(today);
    setPendingStart(dataStartDate);
    setPendingEnd(today);
  };

  const handleStartDateChange = (date) => {
    setPendingStart(date ?? dataStartDate);
  };

  const handleEndDateChange = (date) => {
    setPendingEnd(date ?? today);
  };

  // Native <input type="date"> handlers, used on mobile in place of react-datepicker
  const handleNativeStartChange = (event) => {
    const value = event.target.value;
    handleStartDateChange(
      value ? parse(value, "yyyy-MM-dd", new Date()) : null,
    );
  };

  const handleNativeEndChange = (event) => {
    const value = event.target.value;
    handleEndDateChange(value ? parse(value, "yyyy-MM-dd", new Date()) : null);
  };

  return (
    <>
      <StyledButtonContainer className="picker-outline">
        <h6>Crash date</h6>
        <StyledDateRow>
          {isMobile ? (
            <>
              <StyledNativeDateInput
                id={`map-start-date-${type}`}
                type="date"
                value={format(pendingStart, "yyyy-MM-dd")}
                onChange={handleNativeStartChange}
                min={format(minDate, "yyyy-MM-dd")}
                max={format(today, "yyyy-MM-dd")}
              />
              {"-"}
              <StyledNativeDateInput
                id={`map-end-date-${type}`}
                type="date"
                value={format(pendingEnd, "yyyy-MM-dd")}
                onChange={handleNativeEndChange}
                min={format(minDate, "yyyy-MM-dd")}
                max={format(today, "yyyy-MM-dd")}
              />
            </>
          ) : (
            <>
              <StyledDatePicker
                id={`map-start-date-${type}`}
                selected={pendingStart}
                onChange={handleStartDateChange}
                dateFormat={DATE_FORMAT}
                maxDate={today}
              />
              {"-"}
              <StyledDatePicker
                id={`map-end-date-${type}`}
                selected={pendingEnd}
                onChange={handleEndDateChange}
                dateFormat={DATE_FORMAT}
                maxDate={today}
              />
            </>
          )}
          {!isMobile && (
            <StyledCalendarIcon
              title="Date range"
              icon={faCalendar}
              color={colors.dark}
            />
          )}
        </StyledDateRow>
        <StyledActionRow>
          {showReset && (
            <Button size="sm" color="dark" onClick={handleReset}>
              <FontAwesomeIcon icon={faUndo} className="me-1" />
              Reset
            </Button>
          )}
          {hasPendingChange && (
            <Button
              size="sm"
              color="dark"
              onClick={handleApply}
              disabled={!hasPendingChange}
            >
              Apply date filter
            </Button>
          )}
        </StyledActionRow>
      </StyledButtonContainer>
    </>
  );
};

export default SideMapControlDateRange;
