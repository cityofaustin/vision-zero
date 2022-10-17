import React, { useState, useEffect } from "react";
import { withApollo } from "react-apollo";
import styled from "styled-components";
import { format, parseISO } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { colors } from "../styles/colors";

const StyledDatePicker = styled.div`
  /* Add Bootstrap styles to picker inputs */
  .react-datepicker__input-container > input {
    height: calc(1.5em + 0.75rem + 2px);
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
    color: ${colors.grey700};
    background-color: ${colors.white};
    background-clip: padding-box;
    border: 1px solid ${colors.grey200};
    border-radius: 0.25rem;
  }

  .react-datepicker__day--selecting-range-start {
    background-color: ${colors.primary} !important;
  }

  .react-datepicker__day--selecting-range-end {
    background-color: ${colors.primary} !important;
  }

  .react-datepicker__day--selected {
    background-color: ${colors.primary} !important;
  }

  .react-datepicker__day--in-selecting-range {
    background-color: ${colors.light};
    color: ${colors.dark};
  }

  .react-datepicker__day.react-datepicker__day--in-range {
    background-color: ${colors.secondary};
  }

  .react-datepicker__header {
    background-color: ${colors.light};
  }
`;

const GridDateRange = ({
  setDateRangeFilter,
  initStartDate,
  initEndDate,
  uniqueKey,
  minDate,
}) => {
  /**
   * Parses a string into proper format
   * @param {string} date - date string to be formatted
   * @returns {Date}
   */

  const parseDate = date => parseISO(date);

  /**
   * Returns a date in a valid SQL format.
   * @param {string} date - The string to be transformed
   * @param {string} fallbackValue - The value to use if the formattedDate is invalid
   * @returns {string}
   */
  const formatDate = (date, fallbackValue) => {
    let formattedDate = format(date, "yyyy-MM-dd");

    if (formattedDate === "Invalid date") {
      formattedDate = format(fallbackValue, "yyyy-MM-dd");
    }
    return formattedDate;
  };

  /**
   * Returns today
   * @type {Date}
   */
  const maxDate = new Date();

  const [startDate, setStartDate] = useState(parseDate(initStartDate));
  const [endDate, setEndDate] = useState(parseDate(initEndDate));

  // Set date range filter in GridTable if startDate or endDate changes
  useEffect(() => {
    setDateRangeFilter({
      startDate: formatDate(startDate, initStartDate),
      endDate: formatDate(endDate, initEndDate),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, setDateRangeFilter]);

  // Set startDate or endDate state if props change
  useEffect(() => {
    setStartDate(parseDate(initStartDate));
    setEndDate(parseDate(initEndDate));
  }, [initStartDate, initEndDate]);

  return (
    <>
      <StyledDatePicker>
        <DatePicker
          id={`start-date-${uniqueKey}`}
          selected={startDate}
          onChange={date => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          // Prevent user from selecting start date after current date
          maxDate={maxDate}
          minDate={minDate}
        />
        <span>{" to "}</span>
        <DatePicker
          id={`end-date-${uniqueKey}`}
          selected={endDate}
          onChange={date => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          // Prevent user from selecting date before startDate (chosen in first DatePicker) or after current date
          minDate={startDate}
          maxDate={maxDate}
        />
      </StyledDatePicker>
    </>
  );
};

export default withApollo(GridDateRange);
