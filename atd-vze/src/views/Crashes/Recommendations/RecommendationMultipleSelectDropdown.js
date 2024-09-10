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
    // If the recommendation record doesnt exist yet we need to format the object for a nested insert
    // to create a new recommendation and a new partner in the same request
    const valuesObject = {
      recommendations_partners: {
        // Mutation expects lookup IDs as integers
        data: { [field]: parseInt(selectedItem.id) },
      },
    };
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
      displayValue={"coord_partner_desc"}
      showCheckbox
      selectedValues={
        partners
          ? getSelectedValues(fieldConfig.fields.coordination_partner_id)
          : null
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
