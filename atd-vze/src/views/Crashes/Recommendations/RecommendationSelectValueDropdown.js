import React, { useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

const RecommendationSelectValueDropdown = ({
  value,
  onOptionClick,
  options,
  field,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = e => {
    const { id } = e.target;

    // Mutation expect lookup IDs as integers
    const valuesObject = { [field]: parseInt(id) };
    onOptionClick(valuesObject);
  };

  // Add a null option to enable users to clear out the value
  const makeOptionsWithNullOption = options => [
    { id: null, description: "None" },
    ...options,
  ];

  return (
    <Dropdown
      toggle={() => {
        setIsOpen(!isOpen);
      }}
      isOpen={isOpen}
      className="mb-3"
    >
      <DropdownToggle
        className="w-100 pt-1 pl-2 d-flex text-left"
        style={{ backgroundColor: "transparent", border: "0" }}
      >
        <div className="flex-grow-1">{value}</div>
        <div>
          <i className="fa fa-caret-down fa-lg"></i>
        </div>
      </DropdownToggle>
      <DropdownMenu className="w-100">
        {makeOptionsWithNullOption(options).map(option => {
          return (
            <DropdownItem
              id={option.id}
              key={option.id}
              onClick={handleOptionClick}
              className="pl-2"
            >
              {option.description}
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
};

export default RecommendationSelectValueDropdown;
