import React, { useState } from "react";
import Multiselect from "multiselect-react-dropdown";

const RecommendationMultipleSelectDropdown = ({ options, onOptionClick }) => {
  // Add a null option to enable users to clear out the value
  const makeOptionsWithNullOption = options => [
    { id: null, description: "None" },
    ...options,
  ];

  return (
    <Multiselect
      options={makeOptionsWithNullOption(options)}
      displayValue={"description"}
      showCheckbox
    ></Multiselect>
  );
};

export default RecommendationMultipleSelectDropdown;
