import React, { useState, useEffect } from "react";
import { StoreContext } from "../../utils/store";
import { DateRangePicker } from "react-dates";
import {
  dataStartDate,
  dataEndDate,
  isValidSocrataDate
} from "../../constants/time";

import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import styled from "styled-components";
import { colors } from "../../constants/colors";

const SideMapControlDateRange = () => {
  const StyledDatePicker = styled.div`
    .CalendarDay__default {
      background: ${colors.light};
      border: ${colors.light};
    }

    .CalendarDay__selected_start {
      background: ${colors.infoDark};
      border: ${colors.infoDark};
    }

    .CalendarDay__selected_span {
      background: ${colors.info};
      border: ${colors.info};
    }

    .CalendarDay__selected_end {
      background: ${colors.infoDark};
      border: ${colors.infoDark};
    }

    .DateRangePicker_picker {
      position: absolute !important;
      overflow-x: visible !important;
      z-index: 4;
    }
  `;

  const [focused, setFocused] = useState(null);
  const [start, setStart] = useState(dataStartDate);
  const [end, setEnd] = useState(dataEndDate);

  const {
    mapDateRange: [mapDate, setMapDate]
  } = React.useContext(StoreContext);

  useEffect(() => {
    setMapDate({ start, end });
  }, [start, end, setMapDate]);

  const handleDateChange = dates => {
    let { startDate, endDate } = dates;

    startDate =
      // If startDate is not null and before n year window, set to dataStartDate
      (!!startDate &&
        startDate.isBefore(dataStartDate, "day") &&
        dataStartDate) ||
      startDate;

    endDate =
      // If endDate is not null and after n year window, set to dataEndDate
      (!!endDate &&
        isValidSocrataDate(startDate) &&
        endDate.isAfter(dataEndDate, "day") &&
        dataEndDate) ||
      endDate;

    setStart(startDate);
    setEnd(endDate);
  };

  // Check if date is outside n year rolling window
  const isOutsideDateLimits = date =>
    date.isBefore(dataStartDate, "day") || date.isAfter(dataEndDate, "day");

  return (
    <StyledDatePicker>
      <DateRangePicker
        startDateId="start_date" // PropTypes.string.isRequired,
        endDateId="end_date" // PropTypes.string.isRequired,
        startDate={start} // momentPropTypes.momentObj or null,
        endDate={end} // momentPropTypes.momentObj or null,
        onDatesChange={handleDateChange} // PropTypes.func.isRequired,
        focusedInput={focused} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
        onFocusChange={focusedInput => setFocused(focusedInput)} // PropTypes.func.isRequired,
        minDate={dataStartDate}
        maxDate={dataEndDate}
        small
        orientation="vertical"
        isOutsideRange={() => false} // Enable past dates
        isDayBlocked={isOutsideDateLimits} // Grey out dates
      />
    </StyledDatePicker>
  );
};

export default SideMapControlDateRange;
