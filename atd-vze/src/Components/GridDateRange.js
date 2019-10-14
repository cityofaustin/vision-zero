import React, { useState, useEffect } from "react";
import { withApollo } from "react-apollo";
import styled from "styled-components";
import moment from "moment";
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

const GridDateRange = ({ setDateRangeFilter, existingDateRange }) => {
  /**
   * Parses a string into proper format
   * @param {string} date - date string to be formatted
   * @returns {Date}
   */
  const parseDate = date => new Date(moment(date).format());

  /**
   * Returns a date in a valid SQL format.
   * @param {string} date - The string to be transformed
   * @returns {string}
   */
  const formatDate = date => moment(date).format("YYYY-MM-DD");

  /**
   * Returns existing selection or date one year ago from today
   * @type {Date}
   */
  const minDate = existingDateRange.startDate
    ? parseDate(existingDateRange.startDate)
    : new Date(
        moment()
          .subtract(1, "year")
          .format()
      );

  /**
   * Returns existing selection or today
   * @type {Date}
   */
  const maxDate = existingDateRange.endDate
    ? parseDate(existingDateRange.endDate)
    : new Date();

  const [startDate, setStartDate] = useState(minDate);
  const [endDate, setEndDate] = useState(maxDate);

  useEffect(() => {
    setDateRangeFilter({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    });
  }, [startDate, endDate, setDateRangeFilter]);

  return (
    <>
      <StyledDatePicker>
        <DatePicker
          selected={parseDate(existingDateRange.startDate)}
          onChange={date => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
        />
        <span>{" to "}</span>
        <DatePicker
          selected={parseDate(existingDateRange.endDate)}
          onChange={date => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          maxDate={new Date()}
        />
      </StyledDatePicker>
    </>
  );
};

export default withApollo(GridDateRange);
