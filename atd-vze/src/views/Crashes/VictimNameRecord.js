import React, { useState } from "react";
import { Table, Button, Input } from "reactstrap";

const VictimNameRecord = ({
  i,
  data,
  refetch,
  fields,
  keyField,
  updateMutation,
  ...props
}) => {
  const [isEditing, setIsEditing] = useState("");
  const [formData, setFormData] = useState("");

  console.log(fields);

  //   console.log(data);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = e => {
    e.preventDefault();

    // RESET state on cancel
    setFormData({});
  };

  const handleInputChange = (e, field) => {
    const newFormState = Object.assign(formData, {
      [field]: e.target.value,
      updated_by: localStorage.getItem("hasura_user_email"),
    });
    setFormData(newFormState);
  };

  const handleSubmit = (e, mutationVariableKey, updateMutation) => {
    e.preventDefault();

    // Append form data state to mutation template
    updateMutation.variables.changes = { ...formData };
    // TODO: instead of personId, use a generic key variable
    // and convert it to camelcase for the mutation object
    updateMutation.variables[mutationVariableKey] = data[keyField];

    props.client.mutate(updateMutation).then(res => {
      if (!res.errors) {
        refetch();
      } else {
        console.log(res.errors);
      }
    });

    // RESET state after submit
    setFormData({});
  };

  const formatValue = field => {
    // console.log(field);
    // console.log(data[field]);
    let fieldValue = data[field];

    // Display null values as blanks, but allow 0
    const isFieldNull = fieldValue === null;
    const isFieldBlank = fieldValue === "";
    return isFieldNull || isFieldBlank ? "NO DATA" : fieldValue;
  };

  const concatenateName = () => {
    var concatenatedName = "";
    Object.keys(fields).map(field => (concatenatedName = +field));
  };

  const mutationVariable = fields.mutationVariableKey;

  return (
    <td key={i}>
      {isEditing && (
        <form onSubmit={e => handleSubmit(e, mutationVariable, updateMutation)}>
          {Object.keys(fields).map(field => {
            return (
              <Input
                type="text"
                defaultValue={formatValue(field)}
                onChange={e => handleInputChange(e, field)}
              ></Input>
            );
          })}
          <div className="d-flex">
            <Button
              type="submit"
              block
              color="primary"
              size="sm"
              style={{ minWidth: "50px" }}
              className="btn-pill mt-2 mr-1"
            >
              <i className="fa fa-check edit-toggle" />
            </Button>
            <Button
              type="cancel"
              block
              color="danger"
              size="sm"
              className="btn-pill mt-2"
              style={{ minWidth: "50px" }}
              onClick={e => handleCancelClick(e)}
            >
              <i className="fa fa-times edit-toggle"></i>
            </Button>
          </div>
        </form>
      )}

      {!isEditing && (
        <span className={formatValue() === "NO DATA" ? "text-muted" : ""}>
          {concatenateName()}
        </span>
      )}

      {
        <Button
          block
          color="secondary"
          size="sm"
          className="btn-pill mt-2"
          style={{ width: "50px" }}
          onClick={e => handleEditClick()}
        >
          <i className="fa fa-pencil edit-toggle" />
        </Button>
      }
    </td>
  );
};

export default VictimNameRecord;
