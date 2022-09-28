import React, { useState } from "react";
import Multiselect from "multiselect-react-dropdown";
import "../crash.scss";

const RecommendationMultipleSelectDropdown = ({
  options,
  onOptionClick,
  partners,
  fieldConfig,
}) => {
  // Add a null option to enable users to clear out the value
  const makeOptionsWithNullOption = options => [
    { id: null, description: "None" },
    ...options,
  ];

  const getSelectedValues = ({ lookupOptions, key }) => {
    return partners.map(partner => partner?.[lookupOptions] || "");
  };

  return (
    <Multiselect
      options={makeOptionsWithNullOption(options)}
      displayValue={"description"}
      showCheckbox
      selectedValues={getSelectedValues(fieldConfig.fields.partner_id)}
      showArrow
      hideSelectedList
      placeholder={getSelectedValues(fieldConfig.fields.partner_id)
        .map(partner => partner.description)
        .join(",  ")}
      id="css_custom"
      style={{
        searchBox: {
          border: "none",
        },
      }}
    ></Multiselect>
  );
};

export default RecommendationMultipleSelectDropdown;
