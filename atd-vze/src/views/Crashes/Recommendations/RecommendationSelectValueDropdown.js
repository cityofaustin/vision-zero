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

  return (
    <Dropdown
      toggle={() => {
        setIsOpen(!isOpen);
      }}
      isOpen={isOpen}
      className="mb-3"
    >
      <DropdownToggle
        className="w-100 pt-1"
        style={{ backgroundColor: "transparent", border: "0" }}
      >
        <div className="row">
          <div className="col-11 px-0">{value}</div>
          <div className="col-1 px-1">
            <i className="fa fa-caret-down fa-lg"></i>
          </div>
        </div>
      </DropdownToggle>
      <DropdownMenu>
        {options.map(option => {
          return (
            <DropdownItem
              id={option.id}
              key={option.id}
              onClick={handleOptionClick}
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
