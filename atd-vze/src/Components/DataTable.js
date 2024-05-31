import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { useAuth0, isReadOnly } from "../auth/authContext";
import ConfirmModal from "./ConfirmModal";
import get from "lodash.get";
import { formatCostToDollars, formatDateTimeString } from "../helpers/format";

import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Col,
  Input,
  Table,
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
  downloadGlobal,
}) => {
  // Disable edit features if only role is "readonly"
  const { getRoles } = useAuth0();
  const roles = getRoles();
  const isReadOnlyUser = isReadOnly(roles);

  const [showModal, setShowModal] = useState(false);

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

  const toggleModal = () => {
    setShowModal(!showModal);
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

                      // Set data table (alternate if defined in data map)
                      const fieldDataTable =
                        fieldConfigObject.alternateTable || dataTable;

                      // If data is nested in hasura relationship, define relationship name in dataMap
                      const nestedData =
                        fieldConfigObject.relationshipName &&
                        data[fieldDataTable][
                          fieldConfigObject.relationshipName
                        ][field];

                      const formattedDollarValue =
                        fieldConfigObject.format === "dollars" &&
                        formatCostToDollars(
                          nestedData || data[fieldDataTable][field]
                        );

                      const formatDateTimeValue =
                        fieldConfigObject.format === "datetime" &&
                        formatDateTimeString(
                          nestedData || data[fieldDataTable][field]
                        );

                      const fieldValue =
                        formattedDollarValue ||
                        formatDateTimeValue ||
                        nestedData ||
                        (formData && formData[field.data]) ||
                        data[fieldDataTable][field];

                      const fieldUiType = fieldConfigObject.uiType;

                      const lookupPrefix = fieldConfigObject.lookupPrefix
                        ? fieldConfigObject.lookupPrefix
                        : field.split("_id")[0];

                      // If there is no lookup options, we can assume the field value can be displayed as is.
                      // If there is a lookup option, then the value is an ID to be referenced in a lookup table.
                      const selectOptions =
                        lookupSelectOptions[fieldConfigObject.lookupOptions];

                      const renderLookupDescString = () => {
                        // make sure the value isn't null blank
                        if (
                          fieldValue === null ||
                          typeof fieldValue === "undefined"
                        )
                          return "";

                        // make sure there is a lookup object in the config
                        if (!selectOptions || !fieldConfigObject.lookupOptions)
                          return fieldValue.toString().toUpperCase();

                        // make sure the config lookup object matches with lookup queries
                        const matchingLookupObject = selectOptions.find(
                          item => item[`${lookupPrefix}_id`] === fieldValue
                        );

                        if (!matchingLookupObject) {
                          console.warn(
                            `${field} has a value of ${fieldValue} which has no match in the related lookup table. You should check to make sure the lookup table isn't missing any rows of data.`
                          );
                          return `ID: ${fieldValue}`;
                        } else {
                          return matchingLookupObject[`${lookupPrefix}_desc`];
                        }
                      };

                      const fieldValueDisplay = renderLookupDescString();
                      const canClickToEdit =
                        !isReadOnlyUser &&
                        fieldConfigObject.editable &&
                        !isEditing;

                      return (
                        <tr
                          key={i}
                          onClick={() => canClickToEdit && setEditField(field)}
                          style={{
                            cursor: canClickToEdit ? "pointer" : "auto",
                          }}
                        >
                          <td className="align-middle">
                            <strong>{fieldLabel}</strong>
                          </td>
                          <td colSpan={isEditing ? 2 : 1}>
                            {isEditing ? (
                              <form
                                onSubmit={e =>
                                  handleFieldUpdate(e, section.fields, field)
                                }
                              >
                                <div className="d-flex">
                                  <div className="flex-grow-1">
                                    {fieldUiType === "select" && (
                                      <Input
                                        autoFocus
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
                                      <Input
                                        autoFocus
                                        name={field}
                                        id={field}
                                        type="text"
                                        defaultValue={fieldValue}
                                        onChange={e => handleInputChange(e)}
                                        autoComplete="off"
                                        // disable 1password autofill
                                        data-1p-ignore
                                      />
                                    )}
                                    {fieldUiType === "boolean" && (
                                      <Input
                                        autoFocus
                                        defaultValue={fieldValue}
                                        type="select"
                                        onChange={e => handleInputChange(e)}
                                      >
                                        <option value={true}>TRUE</option>
                                        <option value={false}>FALSE</option>
                                      </Input>
                                    )}
                                  </div>
                                  <div className="my-auto pl-2 d-flex">
                                    <Button
                                      type="submit"
                                      color="primary"
                                      size="sm"
                                      className="btn-pill mr-1"
                                    >
                                      <i className="fa fa-check edit-toggle" />
                                    </Button>
                                    <Button
                                      type="cancel"
                                      color="danger"
                                      size="sm"
                                      className="btn-pill"
                                      onClick={e => handleCancelClick(e)}
                                    >
                                      <i className="fa fa-times edit-toggle"></i>
                                    </Button>
                                  </div>
                                </div>
                              </form>
                            ) : (
                              fieldValueDisplay
                            )}
                          </td>
                          {!isEditing && (
                            <td style={{ textAlign: "right" }}>
                              {canClickToEdit && (
                                <i className="fa fa-pencil edit-toggle" />
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
                {/* If button parameters are set and the defined condition is met, show button */}
                {section.button &&
                  !section.button.buttonConfirm &&
                  data[buttonCondition.dataTableName][0][
                    buttonCondition.dataPath
                  ] === buttonCondition.value && (
                    <Button
                      color="danger"
                      onClick={e => onButtonClick(e, section)}
                    >
                      {section.button.buttonText}
                    </Button>
                  )}
                {/* If button confirm parameters are set, show button and confirm modal */}
                {section.button &&
                  section.button.buttonConfirm &&
                  data[buttonCondition.dataTableName][0][
                    buttonCondition.dataPath
                  ] === buttonCondition.value && (
                    <>
                      <Button color="danger" onClick={toggleModal}>
                        {section.button.buttonText}
                      </Button>
                      {section.button.buttonConfirm && showModal && (
                        <ConfirmModal
                          modalHeader={
                            section.button.buttonConfirm.confirmHeader
                          }
                          modalBody={section.button.buttonConfirm.confirmBody}
                          confirmClick={e => onButtonClick(e, section)}
                          toggleModal={toggleModal}
                          showModal={showModal}
                        />
                      )}
                    </>
                  )}
              </CardBody>
              <CardFooter>{downloadGlobal}</CardFooter>
            </Card>
          </Col>
        );
      })}
    </>
  );
};

export default DataTable;
