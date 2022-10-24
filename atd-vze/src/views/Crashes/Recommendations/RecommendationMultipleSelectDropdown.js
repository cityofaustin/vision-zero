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
  // Trigger mutation call to add partner upon click
  const handleOptionClick = selectedItem => {
    // Mutation expect lookup IDs as integers
    const valuesObject = { [field]: parseInt(selectedItem.id) };
    onOptionClick(valuesObject);
  };

  // Trigger mutation call to remove partner upon click
  const handleRemoveClick = removedItem => {
    const partnerId = parseInt(removedItem.id);
    onOptionRemove(partnerId);
  };

  // Return a list of selected partners for current crash recommendation
  const getSelectedValues = ({ lookupOptions }) => {
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
      onSelect={(selectedList, selectedItem) => handleOptionClick(selectedItem)}
      onRemove={(selectedList, removedItem) => handleRemoveClick(removedItem)}
      closeOnSelect={false}
      customCloseIcon={<i className="fa fa-times edit-toggle"></i>}
      avoidHighlightFirstOption
    ></Multiselect>
  );
};

export default RecommendationMultipleSelectDropdown;
