import React, { useState } from "react";
import { Table, Badge, Button, Input } from "reactstrap";

import { useAuth0, isReadOnly } from "../../auth/authContext";

const RelatedRecordsTable = ({
  fieldConfig,
  data,
  sortField,
  tableName,
  keyField,
  lookupOptions,
  mutation,
  refetch,
  ...props
}) => {
  const [editField, setEditField] = useState("");
  const [editRow, setEditRow] = useState("");
  const [formData, setFormData] = useState("");

  // Disable edit features if only role is "readonly"
  const { getRoles } = useAuth0();
  const roles = getRoles();

  const handleEditClick = (field, row) => {
    setEditField(field);
    setEditRow(row);
  };

  const handleCancelClick = e => {
    e.preventDefault();

    // RESET state on cancel
    setEditField("");
    setEditRow("");
    setFormData({});
  };

  const handleInputChange = (e, updateFieldKey) => {
    const newFormState = Object.assign(formData, {
      [updateFieldKey]: e.target.value,
      updated_by: localStorage.getItem("hasura_user_email"),
    });
    setFormData(newFormState);
  };

  const handleSubmit = (e, mutationVariableKey) => {
    e.preventDefault();

    // Append form data state to mutation template
    mutation.variables.changes = { ...formData };
    // TODO: instead of personId, use a generic key variable
    // and convert it to camelcase for the mutation object
    mutation.variables[mutationVariableKey] = editRow[keyField];

    props.client.mutate(mutation).then(res => {
      if (!res.errors) {
        refetch();
      } else {
        console.log(res.errors);
      }
    });

    // RESET state after submit
    setEditField("");
    setEditRow("");
    setFormData({});
  };

  const formatValue = (data, field) => {
    let fieldValue = data[field];

    if (typeof data[field] === "object") {
      fieldValue =
        data[field] && data[field][fieldConfig.fields[field].lookup_desc];
    }

    // Display null values as blanks, but allow 0
    const isFieldNull = fieldValue === null;
    const isFieldBlank = fieldValue === "";

    return isFieldNull || isFieldBlank ? "NO DATA" : fieldValue;
  };

  return (
    <>
      <h5>{fieldConfig.title}</h5>
      <Table responsive>
        <thead>
          <tr>
            {Object.keys(fieldConfig.fields).map(field => (
              <th key={`th_${fieldConfig.fields[field].label}`}>
                {fieldConfig.fields[field].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data
            .sort((a, b) => (a[sortField] > b[sortField] ? 1 : -1))
            .map(row => {
              return (
                <tr key={`table-${tableName}-${row[keyField]}`}>
                  {Object.keys(fieldConfig.fields).map((field, i) => {
                    const isEditing = editField === field && row === editRow;

                    const fieldLookupPrefix =
                      fieldConfig.fields[field].lookupPrefix;

                    const updateFieldKey = fieldConfig.fields[field]
                      .updateFieldKey
                      ? fieldConfig.fields[field].updateFieldKey
                      : field;

                    const mutationVariable =
                      fieldConfig.fields[field].mutationVariableKey;

                    const uiType = fieldConfig.fields[field].format;

                    return (
                      <td key={i}>
                        {isEditing && (
                          <form
                            onSubmit={e => handleSubmit(e, mutationVariable)}
                          >
                            {uiType === "text" && (
                              <Input
                                type="text"
                                defaultValue={formatValue(row, field)}
                                onChange={e =>
                                  handleInputChange(e, updateFieldKey)
                                }
                              />
                            )}
                            {uiType === "select" && (
                              <Input
                                name={field}
                                id={field}
                                onChange={e =>
                                  handleInputChange(e, updateFieldKey)
                                }
                                defaultValue={
                                  // Check for null values and display as blank
                                  row[field] &&
                                  row[field][`${fieldLookupPrefix}_id`] !== null
                                    ? row[field][`${fieldLookupPrefix}_id`]
                                    : ""
                                }
                                type="select"
                              >
                                {/* Show a NO DATA option only when formatValue is displayed. */}
                                {formatValue(row, field) === "NO DATA" && (
                                  <option value={null}>NO DATA</option>
                                )}
                                {lookupOptions[
                                  fieldConfig.fields[field].lookupOptions
                                ].map(option => {
                                  return (
                                    <option
                                      value={option[`${fieldLookupPrefix}_id`]}
                                      key={option[`${fieldLookupPrefix}_id`]}
                                    >
                                      {option[`${fieldLookupPrefix}_desc`]}
                                    </option>
                                  );
                                })}
                              </Input>
                            )}
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

                        {!isEditing &&
                          (fieldConfig.fields[field].badge ? (
                            <Badge
                              color={fieldConfig.fields[field].badgeColor(
                                formatValue(row, field)
                              )}
                            >
                              {formatValue(row, field)}
                            </Badge>
                          ) : (
                            <span
                              className={
                                formatValue(row, field) === "NO DATA"
                                  ? "text-muted"
                                  : ""
                              }
                            >
                              {formatValue(row, field)}
                            </span>
                          ))}

                        {fieldConfig.fields[field].editable &&
                          !isReadOnly(roles) &&
                          !isEditing && (
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
                  })}
                </tr>
              );
            })}
        </tbody>
      </Table>
    </>
  );
};

export default RelatedRecordsTable;
