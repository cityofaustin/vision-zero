import React, { useState, useEffect } from "react";
import { StoreContext } from "../../utils/store";
import { DateRangePicker } from "react-dates";
import moment from "moment";

import { dataStartDate, dataEndDate } from "../../constants/time";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";

const SideMapControlDateRange = () => {
  // TODO Troublshoot initial dates
  const calendarStartDate = dataStartDate.clone();
  const calendarEndDate = dataEndDate.clone();

  const [focused, setFocused] = useState(null);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  const {
    mapDateRange: [date, setDate]
  } = React.useContext(StoreContext);

  useEffect(() => {
    const convertToSocrataDateFormat = dates => {
      // Dates are passed as moment obj
      const startDate = dates.start.format("YYYY-MM-DD") + "T00:00:00";
      const endDate = dates.end.format("YYYY-MM-DD") + "T23:59:59";

      return { start: startDate, end: endDate };
    };

    if (start !== null && end !== null) {
      const formattedDates = convertToSocrataDateFormat({ start, end });
      setDate(formattedDates);
    }
  }, [start, end, setStart, setEnd, setDate]);

  const handleDateChange = dates => {
    setStart(dates.startDate);
    setEnd(dates.endDate);
  };

  return (
    <DateRangePicker
      startDateId="start_date" // PropTypes.string.isRequired,
      endDateId="end_date" // PropTypes.string.isRequired,
      startDate={start} // momentPropTypes.momentObj or null,
      endDate={end} // momentPropTypes.momentObj or null,
      onDatesChange={handleDateChange} // PropTypes.func.isRequired,
      focusedInput={focused} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
      onFocusChange={focusedInput => setFocused(focusedInput)} // PropTypes.func.isRequired,
    />
  );
};

export default SideMapControlDateRange;
