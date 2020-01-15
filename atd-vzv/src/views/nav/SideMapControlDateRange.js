import React, { useState } from "react";
import { StoreContext } from "../../utils/store";
import moment from "moment";
import { AutoSizer } from "react-virtualized";
import "react-virtualized/styles.css";
import InfiniteCalendar, { Calendar, withRange } from "react-infinite-calendar";
import "react-infinite-calendar/styles.css";

import { colors } from "../../constants/colors";
import { Button } from "reactstrap";
import { mapDataMinDate, mapDataMaxDate } from "../../constants/time";
import styled from "styled-components";

const CalendarWithRange = withRange(Calendar);

const StyledDateRangePicker = styled.div`
  /* Resize month and day in header */
  .Cal__Header__day {
    font-size: 1.3em;
  }
`;

const calendarTheme = {
  accentColor: `${colors.infoDark}`,
  floatingNav: {
    background: `${colors.infoDark}`,
    chevron: `${colors.warning}`,
    color: `${colors.white}`
  },
  headerColor: `${colors.infoDark}`,
  selectionColor: `${colors.info}`,
  textColor: {
    active: `${colors.white}`,
    default: `${colors.dark}`
  },
  todayColor: `${colors.warning}`,
  weekdayColor: `${colors.info}`
};

const SideMapControlDateRange = () => {
  const {
    mapDateRange: [date, setDate]
  } = React.useContext(StoreContext);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const convertToDatePickerDateFormat = date => {
    const startDate = moment(date.start).format("MM/DD/YYYY");
    const endDate = moment(date.end).format("MM/DD/YYYY");
    return { start: new Date(startDate), end: new Date(endDate) };
  };

  const convertToSocrataDateFormat = date => {
    // eventType 3 occurs when selecting the end of date range
    if (date.eventType === 3) {
      const startDate = moment(date.start).format("YYYY-MM-DD") + "T00:00:00";
      const endDate = moment(date.end).format("YYYY-MM-DD") + "T23:59:59";
      const updatedDates = { start: startDate, end: endDate };
      setDate(updatedDates);
      setIsCalendarOpen(false);
    }
  };

  return (
    <StyledDateRangePicker>
      <Button
        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
        // Add some margin below button when calendar is open
        className={`w-100 ${isCalendarOpen && "mb-1"}`}
        color="info"
      >
        Choose Date Range
      </Button>
      {isCalendarOpen && (
        // Autosize as recommended in InfiniteCalendar docs
        <AutoSizer disableHeight>
          {({ width }) => (
            <InfiniteCalendar
              Component={CalendarWithRange}
              selected={convertToDatePickerDateFormat(date)}
              onSelect={convertToSocrataDateFormat}
              width={width}
              height={225}
              min={mapDataMinDate}
              max={mapDataMaxDate}
              minDate={mapDataMinDate}
              maxDate={mapDataMaxDate}
              theme={calendarTheme}
              locale={{
                headerFormat: "MMM Do"
              }}
              displayOptions={{
                showTodayHelper: false
              }}
            />
          )}
        </AutoSizer>
      )}
    </StyledDateRangePicker>
  );
};

export default SideMapControlDateRange;
