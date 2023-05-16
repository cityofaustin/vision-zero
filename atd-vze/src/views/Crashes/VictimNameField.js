import React from "react";
import { Button, Input, Form, FormGroup, Row, Col, Label } from "reactstrap";
import { useQuery } from "@apollo/react-hooks";

import { GET_PERSON_NAMES } from "../../queries/people";

const VictimNameField = ({
  tableName,
  nameFieldConfig,
  mutation,
  handleEditClick,
  handleCancelClick,
  handleInputChange,
  handleSubmit,
  editField,
  editRow,
  row,
  field,
  ...props
}) => {
  const crashId = props.match.params.id;

  const personId =
    tableName === "atd_txdot_primaryperson"
      ? row.primaryperson_id
      : row.person_id;

  const { data, refetch } = useQuery(GET_PERSON_NAMES, {
    variables: { crashId, personId },
  });

  const personData =
    tableName === "atd_txdot_primaryperson"
      ? data?.atd_txdot_primaryperson?.[0]
      : data?.atd_txdot_person?.[0];

  // Format name by concatenating first, middle, last or returning NO DATA
  const formatName = () => {
    var concatenatedName = "";
    Object.keys(nameFieldConfig.subfields).map(field => {
      if (personData?.[field] != null) {
        concatenatedName = concatenatedName.concat(" ", personData?.[field]);
      }
    });
    const isNameBlank = concatenatedName === "";
    return isNameBlank ? "NO DATA" : concatenatedName;
  };

  const mutationVariable = nameFieldConfig.mutationVariableKey;

  const isEditing = editField === field && row === editRow;

  return (
    <td>
      {isEditing && (
        <Form>
          <Row>
            {Object.keys(nameFieldConfig.subfields).map(field => {
              return (
                <Col
                  key={`${tableName}-field-${field}${personId}`}
                  className={"m-1 p-0"}
                >
                  <Label className={"text-muted m-0 p-0"}>
                    {nameFieldConfig.subfields[field].label}
                  </Label>
                  <Input
                    defaultValue={personData[field]}
                    onChange={e => handleInputChange(e, field)}
                    // Make input render in uppercase
                    style={{ textTransform: "uppercase" }}
                  ></Input>
                </Col>
              );
            })}
          </Row>
          <Row>
            <Col className={"mx-1 p-0"}>
              <Button
                type="submit"
                block
                color="primary"
                size="sm"
                style={{ minWidth: "50px" }}
                className="btn-pill mt-2 mr-1"
                onClick={e =>
                  handleSubmit(e, mutationVariable, mutation, refetch)
                }
              >
                <i className="fa fa-check edit-toggle" />
              </Button>
            </Col>
            <Col className={"m-0 p-0"}>
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
            <Col />
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
          onClick={e => handleEditClick(field, row)}
        >
          <i className="fa fa-pencil edit-toggle" />
        </Button>
      )}
    </td>
  );
};

export default VictimNameField;
