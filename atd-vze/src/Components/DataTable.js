import React from "react";
import { useQuery } from "@apollo/react-hooks";
import WarningModal from "./WarningModal";
import get from "lodash.get";
import { formatCostToDollars, formatDateTimeString } from "../helpers/format";

import {
  Card,
  CardHeader,
  CardBody,
  Col,
  Input,
  Table,
  Button,
} from "reactstrap";

import { GET_LOOKUPS } from "../queries/lookups";

const DataTable = ({
  dataMap,
  dataTable,
  setEditField,
  editField,
  data,
  formData,
  handleInputChange,
  handleFieldUpdate,
  handleButtonClick,
}) => {
  // Import Lookup tables and aggregate an object of uiType= "select" options
  const { data: lookupSelectOptions } = useQuery(GET_LOOKUPS);

  const handleCancelClick = e => {
    e.preventDefault();

    setEditField("");
  };

  const onButtonClick = (e, section) => {
    handleFieldUpdate && handleFieldUpdate(e, section, "button");
    handleButtonClick &&
      handleButtonClick(e, section.button.buttonFieldUpdate, data);
  };

  return (
    <>
      {dataMap.map((section, i) => {
        const buttonCondition =
          section.button && section.button.buttonCondition;

        return (
          <Col key={i} md="6">
            <Card key={section.title}>
              <CardHeader>{section.title}</CardHeader>
              <CardBody>
                <Table responsive striped hover>
                  <tbody>
                    {Object.keys(section.fields).map((field, i) => {
                      const isEditing = field === editField;
                      const fieldConfigObject = section.fields[field];

                      const fieldLabel = fieldConfigObject.label;

                      // If data is nested in data object, define path in dataMap
                      const nestedData =
                        fieldConfigObject.dataPath &&
                        get(data[dataTable][0], fieldConfigObject.dataPath);

                      const formattedDollarValue =
                        fieldConfigObject.format === "dollars" &&
                        formatCostToDollars(
                          nestedData || data[dataTable][0][field]
                        );

                      const formatDateTimeValue =
                        fieldConfigObject.format === "datetime" &&
                        formatDateTimeString(
                          nestedData || data[dataTable][0][field]
                        );

                      const fieldValue =
                        formattedDollarValue ||
                        formatDateTimeValue ||
                        nestedData ||
                        (formData && formData[field.data]) ||
                        data[dataTable][0][field];

                      const fieldUiType = fieldConfigObject.uiType;

                      const lookupPrefix = fieldConfigObject.lookupPrefix
                        ? fieldConfigObject.lookupPrefix
                        : field.split("_id")[0];

                      // If there is no lookup options, we can assume the field value can be displayed as is.
                      // If there is a lookup option, then the value is an ID to be referenced in a lookup table.
                      const fieldValueDisplay =
                        // make sure the value isn't null blank
                        fieldValue &&
                        // make sure there is a lookup object in the config
                        !!fieldConfigObject.lookupOptions &&
                        // make sure the config lookup object matches with lookup queries
                        lookupSelectOptions[fieldConfigObject.lookupOptions]
                          ? lookupSelectOptions[
                              fieldConfigObject.lookupOptions
                            ].find(
                              item => item[`${lookupPrefix}_id`] === fieldValue
                            )[`${lookupPrefix}_desc`]
                          : fieldValue;

                      const selectOptions =
                        lookupSelectOptions[fieldConfigObject.lookupOptions];

                      return (
                        <tr key={i}>
                          <td>
                            <strong>{fieldLabel}</strong>
                          </td>
                          <td>
                            {isEditing ? (
                              <form
                                onSubmit={e =>
                                  handleFieldUpdate(e, section.fields, field)
                                }
                              >
                                {fieldUiType === "select" && (
                                  <Input
                                    name={field}
                                    id={field}
                                    onChange={e => handleInputChange(e)}
                                    defaultValue={fieldValue}
                                    type="select"
                                  >
                                    {selectOptions.map(option => (
                                      <option
                                        value={option[`${lookupPrefix}_id`]}
                                      >
                                        {option[`${lookupPrefix}_desc`]}
                                      </option>
                                    ))}
                                  </Input>
                                )}
                                {fieldUiType === "text" && (
                                  <input
                                    type="text"
                                    defaultValue={fieldValue}
                                    onChange={e => handleInputChange(e)}
                                  />
                                )}

                                <button type="submit">
                                  <i className="fa fa-check edit-toggle" />
                                </button>
                                <button type="cancel">
                                  <i
                                    className="fa fa-times edit-toggle"
                                    onClick={e => handleCancelClick(e)}
                                  ></i>
                                </button>
                              </form>
                            ) : (
                              fieldValueDisplay
                            )}
                          </td>
                          <td>
                            {fieldConfigObject.editable && !isEditing && (
                              <i
                                className="fa fa-pencil edit-toggle"
                                onClick={() => setEditField(field)}
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
                {/* If button parameters are set and the defined condition is met, show button */}
                {section.button &&
                  data[buttonCondition.dataTableName][0][
                    buttonCondition.dataPath
                  ] === buttonCondition.value && (
                    <>
                      <Button
                        color="danger"
                        onClick={e => onButtonClick(e, section)}
                      >
                        {section.button.buttonText}
                      </Button>
                      {section.button.buttonConfirm && (
                        <WarningModal
                          modalHeader={
                            section.button.buttonConfirm.confirmHeader
                          }
                          modalBody={section.button.buttonConfirm.confirmBody}
                        />
                      )}
                    </>
                  )}
              </CardBody>
            </Card>
          </Col>
        );
      })}
    </>
  );
};

export default DataTable;
