import React from "react";
import { Button } from "reactstrap";

const SaveButton = (table, setEditedField, mutation, variableDict, refetch) => {
  const id = table.id;
  const handleSaveClick = () => {
    mutation({
      variables: variableDict,
    })
      .then(response => {
        [refetch]().then(response => {
          setEditedField("");
        });
      })
      .catch(error => console.error(error));
  };

  return (
    <Button
      color="primary"
      className="btn-pill mt-2"
      size="sm"
      style={{ width: "50px" }}
      onClick={e => handleSaveClick}
    >
      <i className="fa fa-check edit-toggle" />
    </Button>
  );
};

export default SaveButton;
