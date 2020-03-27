import React, { useState } from "react";
import { StoreContext } from "../../utils/store";
import { DateRangePicker } from "react-dates";
import moment from "moment";

import { dataStartDate, dataEndDate } from "../../constants/time";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";

const SideMapControlDateRange = () => {
  // TODO Troublshoot initial dates
  const [focused, setFocused] = useState(null);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  const {
    mapDateRange: [date, setDate]
  } = React.useContext(StoreContext);

  const convertToSocrataDateFormat = dates => {
    // Dates are passed as moment obj
    const startDate = dates.startDate.format("YYYY-MM-DD") + "T00:00:00";
    const endDate = dates.endDate.format("YYYY-MM-DD") + "T23:59:59";

    return { start: startDate, end: endDate };
  };

  const handleDateChange = dates => {
    setStart(dates.startDate);
    setEnd(dates.endDate);

    if (dates.startDate !== null && dates.endDate !== null) {
      const formattedDates = convertToSocrataDateFormat(dates);
      setDate(formattedDates);
    }
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
