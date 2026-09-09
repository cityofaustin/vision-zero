import React, { useState, useEffect } from "react";
import { StoreContext } from "src/constants/context";
import styled from "styled-components";
import { dataStartDate, today } from "../../constants/time";
import { colors } from "../../constants/colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faInfoCircle,
  faArrowRight,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse, isValid, format } from "date-fns";
import { Button } from "reactstrap";

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
    start.getTime() !== dataStartDate.getTime() || end.getTime() !== today.getTime();

  const { setMapDateRange: setMapDate } = React.useContext(StoreContext);

  // Update map date range in Context when the applied dates change
  // (on mount, and whenever Apply or Reset is clicked)
  useEffect(() => {
    setMapDate({ start, end });
  }, [start, end, setMapDate]);

  const handleApply = () => {
    setStart(pendingStart);
    setEnd(pendingEnd);
  };

  const handleReset = () => {
    setStart(dataStartDate);
    setEnd(today);
    setPendingStart(dataStartDate);
    setPendingEnd(today);
  };

  const handleStartDateChange = (date) => {
    if (!date) {
      setPendingStart(dataStartDate);
    } else {
      setPendingStart(date);
    }
  };

  const handleEndDateChange = (date) => {
    if (!date) {
      setPendingEnd(today);
    } else {
      setPendingEnd(date);
    }
  };

  /**
   * Raw date handlers intervene when user enters a date before the min data date
   */
  const handleStartDateRaw = (event) => {
    const clamped = clampToMinDate(event.target.value);
    if (clamped) setPendingStart(clamped);
  };

  const handleEndDateRaw = (event) => {
    const clamped = clampToMinDate(event.target.value);
    if (clamped) setPendingEnd(clamped);
  };

  // Native <input type="date"> handlers, used on mobile in place of react-datepicker
  const handleNativeStartChange = (event) => {
    const value = event.target.value;
    handleStartDateChange(value ? parse(value, "yyyy-MM-dd", new Date()) : null);
  };

  const handleNativeEndChange = (event) => {
    const value = event.target.value;
    handleEndDateChange(value ? parse(value, "yyyy-MM-dd", new Date()) : null);
  };

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
    padding-left: 2px;
    display: flex;
    flex-direction: column;
    color: ${colors.dark};
    .end-date-popper {
      margin-left: -24px;
    }
  `;

  const StyledDateRow = styled.div`
    height: 34px;
    display: flex;
    justify-content: space-around;
    align-items: center;
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
    button {
      flex: 1;
    }
  `;

  return (
    <>
      <StyledButtonContainer className="pe-0 picker-outline">
        <div style={{padding: "5px"}}><h6>Date range</h6>
         <div className="form-text">
        <span>
          <FontAwesomeIcon
            icon={faInfoCircle}
           className="me-1"
          />
        </span>
        <span>Data starts in 2014</span>
      </div></div>
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
                onChangeRaw={handleStartDateRaw}
                dateFormat={DATE_FORMAT}
                minDate={minDate}
                maxDate={today}
                popperPlacement="bottom-start"
              />
              {"-"}
              <StyledDatePicker
                id={`map-end-date-${type}`}
                selected={pendingEnd}
                onChange={handleEndDateChange}
                onChangeRaw={handleEndDateRaw}
                dateFormat={DATE_FORMAT}
                minDate={minDate}
                maxDate={today}
                popperPlacement="bottom"
                popperClassName="end-date-popper"
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
        {(true) && (
          <div className="p-2">
            <StyledActionRow>
              {showReset && (
                <Button size="sm" outline color="dark" onClick={handleReset}>
                  <FontAwesomeIcon icon={faUndo} className="me-1" />
                  Reset
                </Button>
              )}
              {!showReset && (
                <Button size="sm" color="dark" onClick={handleApply}
                disabled={!hasPendingChange}
                >
                  Apply filter
                  <FontAwesomeIcon icon={faArrowRight} className="ms-1" />
                </Button>
              )}
            </StyledActionRow>
          </div>
        )}
      </StyledButtonContainer>
    </>
  );
};

export default SideMapControlDateRange;
