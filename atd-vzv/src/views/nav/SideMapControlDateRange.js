import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { StoreContext } from "../../utils/store";
import moment from "moment";
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
  #calendar-container {
    z-index: 2;
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    background-color: ${colors.dark + "54"};
  }

  #calendar {
    z-index: 3;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .Cal__Header__day {
    font-size: 1.3em !important;
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

  const mount = document.getElementById("root");
  const el = document.createElement("div");

  useEffect(() => {
    mount.appendChild(el);
    return () => mount.removeChild(el);
  }, [el, mount]);

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

  const calendarPortal = createPortal(
    <StyledDateRangePicker>
      <div id="calendar-container">
        <div id="calendar">
          <InfiniteCalendar
            Component={CalendarWithRange}
            selected={convertToDatePickerDateFormat(date)}
            onSelect={convertToSocrataDateFormat}
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
        </div>
      </div>
    </StyledDateRangePicker>,
    el
  );

  return (
    <>
      <Button
        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
        // Add some margin below button when calendar is open
        className={`w-100`}
        color="info"
      >
        Choose Date Range
      </Button>
      {isCalendarOpen && calendarPortal}
    </>
  );
};

export default SideMapControlDateRange;
