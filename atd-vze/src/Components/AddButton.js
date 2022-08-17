import React from "react";
import { Button } from "reactstrap";

const AddButton = (
  setNewInput,
  insertMutation,
  variableDict,
  refetch,
  onClick,
  data
) => {
  return (
    <Button
      type="submit"
      color="primary"
      onClick={onClick}
      className="btn-pill mt-2"
      size="sm"
      style={{ width: "50px" }}
    >
      Add
    </Button>
  );
};

export default AddButton;
