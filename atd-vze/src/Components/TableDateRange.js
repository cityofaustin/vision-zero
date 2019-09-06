import React, { useState, useEffect } from "react";
import { withApollo } from "react-apollo";
import styled from "styled-components";
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
    color: #5c6873;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #e4e7ea;
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

// TODO add query operators to each field to better fit data types (_eq, etc.)?
const TableDateRange = ({ setSearchFilter, clearFilters, fieldsToSearch }) => {
  const minDate = new Date("2010/01/01"); // TODO add programatic way to insert earliest crash record in DB
  const [searchFieldValue, setSearchFieldValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [fieldToSearch, setFieldToSearch] = useState("");
  const [isFieldSelected, setIsFieldSelected] = useState(false);
  const [startDate, setStartDate] = useState(minDate);
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const searchQuery = () => {
      let queryStringArray = [];
      queryStringArray.push({
        SEARCH: `where: { ${fieldToSearch}: { _in: "${searchValue}" } }`,
      });
      queryStringArray.push({ type: `Search` });
      return queryStringArray;
    };
    const queryStringArray = searchQuery();
    searchValue !== "" &&
      fieldToSearch !== "" &&
      setSearchFilter(queryStringArray);
  }, [searchValue, setSearchFilter, fieldToSearch, searchFieldValue]);

  const handleSearchSubmission = e => {
    e.preventDefault();
    if (isFieldSelected) {
      const uppercaseSearchValue = searchFieldValue.toUpperCase();
      fieldToSearch !== "" && setSearchValue(uppercaseSearchValue);
    }
  };

  const handleClearSearchResults = () => {
    clearFilters();
    setSearchFieldValue("");
    setSearchValue("");
    setFieldToSearch("");
    setIsFieldSelected(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleFieldSelect = e => {
    setIsFieldSelected(true);
    setFieldToSearch(e.target.value);
  };

  const getFieldName = fieldKey =>
    Object.values(
      fieldsToSearch.find(field => Object.keys(field)[0] === fieldKey)
    );

  return (
    <>
      <StyledDatePicker>
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          selectsStart
          minDate={minDate}
          startDate={startDate}
          endDate={endDate}
        />
        <span>{" to "}</span>
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
        />
      </StyledDatePicker>
    </>
  );
};

export default withApollo(TableDateRange);
