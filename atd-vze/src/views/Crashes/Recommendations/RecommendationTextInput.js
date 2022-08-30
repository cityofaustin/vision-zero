import React, { useState } from "react";
import { Button, Input } from "reactstrap";

const RecommendationTextInput = ({
  label,
  placeholder,
  existingValue,
  field,
  doesRecommendationRecordExist,
  onAdd,
  onEdit,
}) => {
  // This bool helps us differentiate between showing add or edit icon when record already exists
  const isExistingValue = existingValue.length > 0 && existingValue !== null;
  // Helps us initialize the input value if editing and existing value
  const initialInputValue = isExistingValue ? existingValue : "";

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(initialInputValue);

  const handleAddClick = () => {
    const valuesObject = { [field]: inputValue };

    onAdd(valuesObject);
    setIsEditing(false);
  };

  const handleSaveClick = () => {
    const valuesObject = { [field]: inputValue };

    onEdit(valuesObject);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setInputValue(existingValue);
  };

  // Recommendation record does not exist yet, adding a value will create record
  const isAddingRecommendation =
    doesRecommendationRecordExist === false && isEditing === false;
  // Recommendation record exists and we can edit the value
  const canEditRecommendation =
    doesRecommendationRecordExist === true && isEditing === false;
  // Recommendation record exists and we are editing with the input
  const isEditingRecommendation =
    doesRecommendationRecordExist === true && isEditing === true;

  return (
    <div>
      <p>
        <b>{label}</b>
      </p>
      <div className="d-flex">
        {(isAddingRecommendation ||
          isEditingRecommendation ||
          !isExistingValue) && (
          <div className="col flex-grow-1 pl-0">
            <Input
              type="textarea"
              placeholder={placeholder}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            ></Input>
          </div>
        )}
        {canEditRecommendation && isExistingValue && (
          <div className="col flex-grow-1">{existingValue}</div>
        )}
        {/* First button*/}
        {/* Inline pixel widths and padding are based on lining up button grid with table used in Notes component */}
        <div style={{ width: "121px", padding: "12px 4px 12px 9px" }}>
          {isAddingRecommendation && (
            <Button
              type="submit"
              color="primary"
              onClick={handleAddClick}
              className="btn-pill mt-2"
              size="sm"
              style={{ width: "50px" }}
            >
              Add
            </Button>
          )}
          {!isAddingRecommendation && !isExistingValue && (
            <Button
              type="submit"
              color="primary"
              onClick={handleSaveClick}
              className="btn-pill mt-2"
              size="sm"
              style={{ width: "50px" }}
            >
              Add
            </Button>
          )}
          {canEditRecommendation && isExistingValue && (
            <Button
              color="secondary"
              size="sm"
              className="btn-pill mt-2"
              style={{ width: "50px" }}
              onClick={handleEditClick}
            >
              <i className="fa fa-pencil edit-toggle" />
            </Button>
          )}
          {isEditingRecommendation && (
            <Button
              color="primary"
              className="btn-pill mt-2"
              size="sm"
              style={{ width: "50px" }}
              onClick={handleSaveClick}
            >
              <i className="fa fa-check edit-toggle" />
            </Button>
          )}
          {/* Second button */}
          {isEditingRecommendation && (
            <Button
              color="danger"
              className="btn-pill mt-2"
              size="sm"
              style={{ width: "50px", marginLeft: "8px" }}
              onClick={handleCancelClick}
            >
              <i className="fa fa-times edit-toggle" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationTextInput;
