import React, { useState, useEffect } from "react";
import { withApollo } from "react-apollo";

// TODO add query operators to each field to better fit data types (_eq, etc.)?
const TableDateRange = ({ setSearchFilter, clearFilters, fieldsToSearch }) => {
  const [searchFieldValue, setSearchFieldValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [fieldToSearch, setFieldToSearch] = useState("");
  const [isFieldSelected, setIsFieldSelected] = useState(false);

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

  return <div>Test</div>;
};

export default withApollo(TableDateRange);
