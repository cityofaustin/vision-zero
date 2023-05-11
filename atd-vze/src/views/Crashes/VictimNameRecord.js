import React, { useState } from "react";
import { Button, Input, Form, FormGroup, Row, Col, Label } from "reactstrap";

const VictimNameRecord = ({
  i,
  data,
  refetch,
  nameFieldConfig,
  keyField,
  mutation,
  ...props
}) => {
  const [isEditing, setIsEditing] = useState("");
  const [formData, setFormData] = useState("");

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = e => {
    // RESET state on cancel
    setFormData({});
    setIsEditing(false);
  };

  const handleInputChange = (e, field) => {
    // Change new value to null if it only contains whitespaces
    const newValue = e.target.value.trim().length === 0 ? null : e.target.value;
    const newFormState = Object.assign(formData, {
      [field]: newValue,
      updated_by: localStorage.getItem("hasura_user_email"),
    });
    setFormData(newFormState);
  };

  const handleSubmit = (e, mutationVariableKey, mutation) => {
    e.preventDefault();

    // Append form data state to mutation template
    mutation.variables.changes = { ...formData };
    // TODO: instead of personId, use a generic key variable
    // and convert it to camelcase for the mutation object
    mutation.variables[mutationVariableKey] = data[keyField];

    props.client.mutate(mutation).then(res => {
      if (!res.errors) {
        refetch();
      } else {
        console.log(res.errors);
      }
    });

    // RESET state after submit
    setFormData({});
    setIsEditing(false);
  };

  // Format name by concatenating first, middle, last or returning NO DATA
  const formatName = () => {
    var concatenatedName = "";
    Object.keys(nameFieldConfig.subfields).map(field => {
      if (data[field] != null) {
        concatenatedName = concatenatedName.concat(" ", data[field]);
      }
    });
    const isNameBlank = concatenatedName === "";
    return isNameBlank ? "NO DATA" : concatenatedName;
  };

  const mutationVariable = nameFieldConfig.mutationVariableKey;

  return (
    <td key={i}>
      {isEditing && (
        <Form>
          <Row>
            {Object.keys(nameFieldConfig.subfields).map(field => {
              return (
                <Col>
                  <FormGroup>
                    <Label>{nameFieldConfig.subfields[field].label}</Label>
                    <Input
                      defaultValue={data[field]}
                      onChange={e => handleInputChange(e, field)}
                    ></Input>
                  </FormGroup>
                </Col>
              );
            })}
          </Row>
          <Row>
            <Col>
              <Button
                type="submit"
                block
                color="primary"
                size="sm"
                style={{ minWidth: "50px" }}
                className="btn-pill mt-2 mr-1"
                onClick={e => handleSubmit(e, mutationVariable, mutation)}
              >
                <i className="fa fa-check edit-toggle" />
              </Button>
            </Col>
            <Col>
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
            </Col>
          </Row>
        </Form>
      )}

      {!isEditing && (
        <span className={formatName() === "NO DATA" ? "text-muted" : ""}>
          {formatName()}
        </span>
      )}

      {!isEditing && (
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
      )}
    </td>
  );
};

export default VictimNameRecord;
