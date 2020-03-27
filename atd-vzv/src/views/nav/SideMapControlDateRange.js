import React, { useState } from "react";
import { StoreContext } from "../../utils/store";
import { DateRangePicker } from "react-dates";
import moment from "moment";

import { colors } from "../../constants/colors";
import { Button } from "reactstrap";
import { mapDataMinDate, mapDataMaxDate } from "../../constants/time";
import styled from "styled-components";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";

const StyledDateRangePicker = styled.div``;

const SideMapControlDateRange = () => {
  const {
    mapDateRange: [date, setDate]
  } = React.useContext(StoreContext);

  const [focusedInput, setFocusInput] = useState(null);

  const convertToSocrataDateFormat = date => {
    debugger;
    // Dates are passed as moments
    const startDate = date.startDate.format("YYYY-MM-DD") + "T00:00:00";
    const endDate = date.endDate.format("YYYY-MM-DD") + "T23:59:59";
    const updatedDates = { start: startDate, end: endDate };
    setDate(updatedDates);
  };

  // const handleCalendarPortalContainerClick = event => {
  //   // Close out the modal if the background container is clicked
  //   if (event.target.id !== "calendar-container") return;
  //   setIsCalendarOpen(false);
  // };

  // const handleDataRangeButtonClick = () => {
  //   setIsCalendarOpen(!isCalendarOpen);
  // };

  return (
    <DateRangePicker
      startDate={moment(date.start)} // momentPropTypes.momentObj or null,
      startDateId="start-date" // PropTypes.string.isRequired,
      endDate={moment(date.end)} // momentPropTypes.momentObj or null,
      endDateId="end-date" // PropTypes.string.isRequired,
      onDatesChange={({ startDate, endDate }) =>
        convertToSocrataDateFormat({ startDate, endDate })
      } // PropTypes.func.isRequired,
      focusedInput={focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
      onFocusChange={focusedInput => setFocusInput(focusedInput)} // PropTypes.func.isRequired,
    />
  );
};

export default SideMapControlDateRange;
