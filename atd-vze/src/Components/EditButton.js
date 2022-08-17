import React from "react";
import { Button } from "reactstrap";

const EditButton = (setEditMode, setEditedField, fieldData, crashId) => {
  const handleEditClick = () => {
    setEditedField(fieldData);
    setEditMode(true);
  };

  return (
    <Button
      color="secondary"
      size="sm"
      className="btn-pill mt-2"
      style={{ width: "50px" }}
      onClick={handleEditClick}
    >
      <i className="fa fa-pencil edit-toggle" />
    </Button>
  );
};

export default EditButton;
