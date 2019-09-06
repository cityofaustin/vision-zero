import React, { useState, useEffect } from "react";
import { withApollo } from "react-apollo";
import styled from "styled-components";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { colors } from "../styles/colors";

const StyledDatePicker = styled.div`
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
    color: black;
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
  const [searchFieldValue, setSearchFieldValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [fieldToSearch, setFieldToSearch] = useState("");
  const [isFieldSelected, setIsFieldSelected] = useState(false);
  const [startDate, setStartDate] = useState(new Date("2010/01/01")); // TODO add programatic way to insert earliest crash record in DB
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
