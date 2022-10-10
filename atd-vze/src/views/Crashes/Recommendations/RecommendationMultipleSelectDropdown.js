import React from "react";
import Multiselect from "multiselect-react-dropdown";
import "../crash.scss";

const RecommendationMultipleSelectDropdown = ({
  options,
  onOptionClick,
  onOptionRemove,
  partners,
  fieldConfig,
  field,
}) => {
  const handleOptionClick = (selectedList, selectedItem) => {
    const valuesObject = { [field]: parseInt(selectedItem.id) };
    onOptionClick(valuesObject);
  };
  // Add a null option to enable users to clear out the value
  const makeOptionsWithNullOption = options => [
    { id: null, description: "None" },
    ...options,
  ];

  const handleRemoveClick = (selectedList, removedItem) => {
    const partnerId = parseInt(removedItem.id);
    onOptionRemove(partnerId);
  };

  const getSelectedValues = ({ lookupOptions, key }) => {
    return partners.map(partner => partner?.[lookupOptions] || "");
  };

  return (
    <Multiselect
      options={options}
      displayValue={"description"}
      showCheckbox
      selectedValues={
        partners ? getSelectedValues(fieldConfig.fields.partner_id) : null
      }
      showArrow
      hidePlaceholder
      placeholder={""}
      id="css_custom"
      style={{
        searchBox: {
          border: "none",
        },
      }}
      onSelect={(selectedList, selectedItem) =>
        handleOptionClick(selectedList, selectedItem)
      }
      onRemove={(selectedList, removedItem) =>
        handleRemoveClick(selectedList, removedItem)
      }
      closeOnSelect={false}
      customCloseIcon={<i className="fa fa-times edit-toggle"></i>}
      customArrow={<i className="fa fa-caret-down fa-lg"></i>}
      avoidHighlightFirstOption
    ></Multiselect>
  );
};

export default RecommendationMultipleSelectDropdown;
