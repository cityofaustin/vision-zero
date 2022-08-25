import React, { useState } from "react";
import { Button, Input } from "reactstrap";

const RecommendationTextInputRow = ({
  label,
  placeholder,
  existingValue,
  field,
  doesRecommendationRecordExist,
  onAdd,
  onEdit,
}) => {
  const isExistingValue = existingValue.length > 0 && existingValue !== null;
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
  };

  const isAddingRecommendation =
    doesRecommendationRecordExist === false && isEditing === false;
  const canEditRecommendation =
    doesRecommendationRecordExist === true && isEditing === false;
  const isEditingRecommendation =
    doesRecommendationRecordExist === true && isEditing === true;

  return (
    <div className="row">
      <div className="col-12">
        <div>
          <p>
            <b>{label}</b>
          </p>
          <div className="row">
            {(isAddingRecommendation ||
              isEditingRecommendation ||
              !isExistingValue) && (
              <div className="col-10">
                <Input
                  type="textarea"
                  placeholder={placeholder}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                ></Input>
              </div>
            )}
            {canEditRecommendation && isExistingValue && (
              <div className="col-10">{existingValue}</div>
            )}
            {isAddingRecommendation && (
              <div className="col-1">
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
              </div>
            )}
            {!isExistingValue && (
              <div className="col-1">
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
              </div>
            )}
            {canEditRecommendation && isExistingValue && (
              <div className="col-1">
                <Button
                  color="secondary"
                  size="sm"
                  className="btn-pill mt-2"
                  style={{ width: "50px" }}
                  onClick={handleEditClick}
                >
                  <i className="fa fa-pencil edit-toggle" />
                </Button>
              </div>
            )}
            {isEditingRecommendation && (
              <>
                <div className="col-1">
                  <Button
                    color="primary"
                    className="btn-pill mt-2"
                    size="sm"
                    style={{ width: "50px" }}
                    onClick={handleSaveClick}
                  >
                    <i className="fa fa-check edit-toggle" />
                  </Button>
                </div>
                <div className="col-1">
                  <Button
                    color="danger"
                    className="btn-pill mt-2"
                    size="sm"
                    style={{ width: "50px" }}
                    onClick={handleCancelClick}
                  >
                    <i className="fa fa-times edit-toggle" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationTextInputRow;
